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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const helpers_util_1 = require("../../common/utils/helpers.util");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const productIds = dto.items.map((i) => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds }, deletedAt: null, isActive: true },
        });
        for (const item of dto.items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
                throw new common_1.BadRequestException(`Sản phẩm không tồn tại hoặc đã ngừng bán`);
            }
        }
        const orderItems = dto.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                note: item.note,
            };
        });
        const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let discountAmount = 0;
        if (dto.couponCode) {
            const coupon = await this.prisma.coupon.findUnique({
                where: { code: dto.couponCode, isActive: true },
            });
            if (coupon) {
                if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
                    if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
                        if (subtotal >= coupon.minOrderAmount) {
                            discountAmount =
                                coupon.discountType === 'PERCENT'
                                    ? (subtotal * coupon.discountValue) / 100
                                    : coupon.discountValue;
                            await this.prisma.coupon.update({
                                where: { code: dto.couponCode },
                                data: { usedCount: { increment: 1 } },
                            });
                        }
                    }
                }
            }
        }
        const totalAmount = Math.max(0, subtotal - discountAmount);
        const orderNumber = (0, helpers_util_1.generateOrderNumber)();
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    customerName: dto.customerName,
                    phone: dto.phone,
                    address: dto.address,
                    note: dto.note,
                    deliveryDate: dto.deliveryDate,
                    deliveryTime: dto.deliveryTime,
                    couponCode: dto.couponCode,
                    discountAmount,
                    totalAmount,
                    userId,
                    items: { create: orderItems },
                },
                include: {
                    items: {
                        include: { product: { include: { images: { take: 1 } } } },
                    },
                },
            });
            for (const item of dto.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        type: 'OUT',
                        quantity: item.quantity,
                        note: `Đơn hàng ${orderNumber}`,
                    },
                });
            }
            return newOrder;
        });
        return order;
    }
    async findAll(query) {
        const { search, status, dateFrom, dateTo, page = 1, limit = 20, } = query;
        const where = {};
        if (search) {
            where.OR = [
                { orderNumber: { contains: search } },
                { customerName: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        if (status)
            where.status = status;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(`${dateFrom}T00:00:00+07:00`);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(`${dateTo}T23:59:59.999+07:00`);
            }
        }
        const skip = (page - 1) * limit;
        const [total, orders] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: { name: true, unit: true, images: { take: 1 } },
                            },
                        },
                    },
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        return {
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findMyOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [total, orders] = await Promise.all([
            this.prisma.order.count({ where: { userId } }),
            this.prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: { id: true, name: true, unit: true, slug: true, isActive: true, stock: true, images: { take: 1 } },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async findById(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: { include: { images: { take: 1 } } },
                    },
                },
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.findById(id);
        if (dto.status === 'CANCELLED' && order.status !== 'CANCELLED') {
            await this.prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id },
                    data: { status: dto.status },
                });
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                    await tx.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            type: 'IN',
                            quantity: item.quantity,
                            note: `Hoàn kho từ đơn hàng hủy ${order.orderNumber}`,
                        },
                    });
                }
            });
            return this.findById(id);
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
            include: {
                items: { include: { product: true } },
            },
        });
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [todayOrders, todayRevenue, pendingOrders, totalOrders, totalRevenue, totalCustomers, recentOrders,] = await Promise.all([
            this.prisma.order.count({
                where: { createdAt: { gte: today, lt: tomorrow } },
            }),
            this.prisma.order.aggregate({
                where: {
                    createdAt: { gte: today, lt: tomorrow },
                    status: { in: ['COMPLETED', 'DELIVERING'] },
                },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.count({
                where: { status: { in: ['PENDING', 'PREPARING'] } },
            }),
            this.prisma.order.count(),
            this.prisma.order.aggregate({
                where: { status: { in: ['COMPLETED', 'DELIVERING'] } },
                _sum: { totalAmount: true },
            }),
            this.prisma.user.count({
                where: { role: 'CUSTOMER', deletedAt: null },
            }),
            this.prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { user: { select: { name: true } } },
            }),
        ]);
        return {
            todayOrders,
            todayRevenue: todayRevenue._sum.totalAmount || 0,
            pendingOrders,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalCustomers,
            recentOrders,
        };
    }
    async deleteOrder(id) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        return this.prisma.order.delete({ where: { id } });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map