import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import {
  createSlug,
  removeVietnameseTones,
  normalizeSearchQuery,
} from '../../common/utils/helpers.util';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách sản phẩm với filter, sort, phân trang
   * Hỗ trợ tìm kiếm không dấu: "ca rot" → "Cà rốt"
   */
  async findAll(query: ProductQueryDto) {
    const {
      search,
      categoryId,
      categorySlug,
      sortBy = 'newest',
      page = 1,
      limit = 20,
      inStock,
      featured,
    } = query;

    // Xây dựng điều kiện where
    const where: any = {
      deletedAt: null,
    };
    
    if (query.activeOnly !== false) {
      where.isActive = true;
    }

    // Tìm kiếm không dấu, gần đúng
    if (search) {
      const normalizedSearch = normalizeSearchQuery(search);
      where.nameSearch = { contains: normalizedSearch };
    }

    if (categoryId) where.categoryId = categoryId;

    // Tìm theo slug danh mục
    if (categorySlug && !categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) where.categoryId = category.id;
    }

    if (inStock === true) where.stock = { gt: 0 };
    if (featured === true) where.isFeatured = true;

    // Sắp xếp
    let orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
      case 'priceAsc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
      case 'priceDesc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
      case 'nameAsc':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    // Chạy song song query đếm và query lấy data
    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 }, // Chỉ lấy ảnh đầu tiên cho list
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Tìm kiếm realtime - trả về nhanh, ít field
   * Dùng cho thanh tìm kiếm gõ realtime
   */
  async search(q: string, limit = 10) {
    const normalized = normalizeSearchQuery(q);
    if (!normalized) return [];

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        nameSearch: { contains: normalized },
      },
      select: {
        id: true,
        name: true,
        price: true,
        unit: true,
        stock: true,
        slug: true,
        images: {
          select: { url: true },
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Lấy chi tiết sản phẩm theo slug */
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  /** Lấy sản phẩm theo ID */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  /** Tạo sản phẩm mới */
  async create(dto: CreateProductDto, imageUrls: string[] = []) {
    // Tạo slug duy nhất
    let slug = createSlug(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = createSlug(dto.name, Date.now().toString().slice(-4));
    }

    // Tạo nameSearch để tìm kiếm không dấu
    const nameSearch = removeVietnameseTones(dto.name);

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        slug,
        nameSearch,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: { images: true, category: true },
    });

    // Ghi log nhập kho
    if (dto.stock > 0) {
      await this.prisma.inventoryLog.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: dto.stock,
          note: 'Nhập kho ban đầu',
        },
      });
    }

    return product;
  }

  /** Cập nhật sản phẩm */
  async update(id: string, dto: UpdateProductDto, imageUrls?: string[]) {
    const product = await this.findById(id);
    const { retainedImageUrls, ...productData } = dto;

    // Cập nhật slug và nameSearch nếu đổi tên
    let slug = product.slug;
    let nameSearch = product.nameSearch;

    if (productData.name && productData.name !== product.name) {
      nameSearch = removeVietnameseTones(productData.name);
      slug = createSlug(productData.name);
      const existing = await this.prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = createSlug(productData.name, Date.now().toString().slice(-4));
      }
    }

    // Ghi log nếu stock thay đổi
    if (productData.stock !== undefined && productData.stock !== product.stock) {
      const diff = productData.stock - product.stock;
      await this.prisma.inventoryLog.create({
        data: {
          productId: id,
          type: diff > 0 ? 'IN' : 'ADJUST',
          quantity: Math.abs(diff),
          note: 'Cập nhật tồn kho qua admin',
        },
      });
    }

    const finalImageUrls =
      imageUrls !== undefined
        ? [...(retainedImageUrls || []), ...imageUrls]
        : retainedImageUrls;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        slug,
        nameSearch,
        ...(finalImageUrls !== undefined && {
          images: {
            deleteMany: {},
            create: finalImageUrls.map((url, index) => ({ url, sortOrder: index })),
          },
        }),
      },
      include: { images: true, category: true },
    });
  }

  /** Xóa mềm sản phẩm */
  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  /** Lấy sản phẩm bán chạy (dùng cho admin dashboard) */
  async getTopSelling(limit = 10) {
    const result = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = result.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        unit: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    });

    // Map số lượng đã bán vào từng sản phẩm
    return products.map((p) => ({
      ...p,
      totalSold: result.find((r) => r.productId === p.id)?._sum.quantity || 0,
    }));
  }
}
