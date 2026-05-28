import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { createSlug } from '../../common/utils/helpers.util';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /** Lấy tất cả danh mục (kèm số lượng sản phẩm) */
  async findAll(activeOnly = false) {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        _count: {
          select: {
            products: { where: { deletedAt: null, isActive: true } },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /** Lấy chi tiết danh mục theo slug */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, deletedAt: null },
      include: {
        _count: {
          select: { products: { where: { deletedAt: null, isActive: true } } },
        },
      },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  /** Tạo danh mục mới */
  async create(dto: CreateCategoryDto) {
    // Tạo slug duy nhất
    let slug = createSlug(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = createSlug(dto.name, Date.now().toString().slice(-4));
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        slug,
      },
    });
  }

  /** Cập nhật danh mục */
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    // Cập nhật slug nếu tên thay đổi
    let slug = category.slug;
    if (dto.name && dto.name !== category.name) {
      slug = createSlug(dto.name);
      const existing = await this.prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = createSlug(dto.name, Date.now().toString().slice(-4));
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: { ...dto, slug },
    });
  }

  /** Xóa mềm danh mục */
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    // Kiểm tra có sản phẩm không
    const productCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Không thể xóa danh mục vì còn ${productCount} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`,
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
