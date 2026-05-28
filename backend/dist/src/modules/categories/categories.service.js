"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const helpers_util_1 = require("../../common/utils/helpers.util");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findBySlug(slug) {
        const category = await this.prisma.category.findUnique({
            where: { slug, deletedAt: null },
            include: {
                _count: {
                    select: { products: { where: { deletedAt: null, isActive: true } } },
                },
            },
        });
        if (!category)
            throw new common_1.NotFoundException('Không tìm thấy danh mục');
        return category;
    }
    async create(dto) {
        let slug = (0, helpers_util_1.createSlug)(dto.name);
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) {
            slug = (0, helpers_util_1.createSlug)(dto.name, Date.now().toString().slice(-4));
        }
        return this.prisma.category.create({
            data: {
                ...dto,
                slug,
            },
        });
    }
    async update(id, dto) {
        const category = await this.prisma.category.findUnique({
            where: { id, deletedAt: null },
        });
        if (!category)
            throw new common_1.NotFoundException('Không tìm thấy danh mục');
        let slug = category.slug;
        if (dto.name && dto.name !== category.name) {
            slug = (0, helpers_util_1.createSlug)(dto.name);
            const existing = await this.prisma.category.findFirst({
                where: { slug, id: { not: id } },
            });
            if (existing) {
                slug = (0, helpers_util_1.createSlug)(dto.name, Date.now().toString().slice(-4));
            }
        }
        return this.prisma.category.update({
            where: { id },
            data: { ...dto, slug },
        });
    }
    async remove(id) {
        const category = await this.prisma.category.findUnique({
            where: { id, deletedAt: null },
        });
        if (!category)
            throw new common_1.NotFoundException('Không tìm thấy danh mục');
        const productCount = await this.prisma.product.count({
            where: { categoryId: id, deletedAt: null },
        });
        if (productCount > 0) {
            throw new common_1.ConflictException(`Không thể xóa danh mục vì còn ${productCount} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`);
        }
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map