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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const helpers_util_1 = require("../../common/utils/helpers.util");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { search, categoryId, categorySlug, sortBy = 'newest', page = 1, limit = 20, inStock, featured, } = query;
        const where = {
            deletedAt: null,
        };
        if (query.activeOnly !== false) {
            where.isActive = true;
        }
        if (search) {
            const normalizedSearch = (0, helpers_util_1.normalizeSearchQuery)(search);
            where.nameSearch = { contains: normalizedSearch };
        }
        if (categoryId)
            where.categoryId = categoryId;
        if (categorySlug && !categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { slug: categorySlug },
            });
            if (category)
                where.categoryId = category.id;
        }
        if (inStock === true)
            where.stock = { gt: 0 };
        if (featured === true)
            where.isFeatured = true;
        let orderBy = {};
        switch (sortBy) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'name':
                orderBy = { name: 'asc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
        }
        const skip = (page - 1) * limit;
        const [total, products] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
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
    async search(q, limit = 10) {
        const normalized = (0, helpers_util_1.normalizeSearchQuery)(q);
        if (!normalized)
            return [];
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
    async findBySlug(slug) {
        const product = await this.prisma.product.findUnique({
            where: { slug, deletedAt: null },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        return product;
    }
    async findById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id, deletedAt: null },
            include: {
                category: true,
                images: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        return product;
    }
    async create(dto, imageUrls = []) {
        let slug = (0, helpers_util_1.createSlug)(dto.name);
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing) {
            slug = (0, helpers_util_1.createSlug)(dto.name, Date.now().toString().slice(-4));
        }
        const nameSearch = (0, helpers_util_1.removeVietnameseTones)(dto.name);
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
    async update(id, dto, imageUrls) {
        const product = await this.findById(id);
        let slug = product.slug;
        let nameSearch = product.nameSearch;
        if (dto.name && dto.name !== product.name) {
            nameSearch = (0, helpers_util_1.removeVietnameseTones)(dto.name);
            slug = (0, helpers_util_1.createSlug)(dto.name);
            const existing = await this.prisma.product.findFirst({
                where: { slug, id: { not: id } },
            });
            if (existing) {
                slug = (0, helpers_util_1.createSlug)(dto.name, Date.now().toString().slice(-4));
            }
        }
        if (dto.stock !== undefined && dto.stock !== product.stock) {
            const diff = dto.stock - product.stock;
            await this.prisma.inventoryLog.create({
                data: {
                    productId: id,
                    type: diff > 0 ? 'IN' : 'ADJUST',
                    quantity: Math.abs(diff),
                    note: 'Cập nhật tồn kho qua admin',
                },
            });
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                ...dto,
                slug,
                nameSearch,
                ...(imageUrls !== undefined && {
                    images: {
                        deleteMany: {},
                        create: imageUrls.map((url, index) => ({ url, sortOrder: index })),
                    },
                }),
            },
            include: { images: true, category: true },
        });
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
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
        return products.map((p) => ({
            ...p,
            totalSold: result.find((r) => r.productId === p.id)?._sum.quantity || 0,
        }));
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map