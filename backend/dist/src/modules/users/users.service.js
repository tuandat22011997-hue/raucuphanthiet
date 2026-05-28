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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
    }
    async findAllCustomers(page = 1, limit = 20, search) {
        const where = {
            role: 'CUSTOMER',
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        const skip = (page - 1) * limit;
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    isActive: true,
                    _count: { select: { orders: true } },
                    orders: {
                        select: { totalAmount: true },
                        where: { status: 'COMPLETED' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        const usersWithStats = users.map((u) => ({
            ...u,
            totalOrders: u._count.orders,
            totalSpent: u.orders.reduce((sum, o) => sum + o.totalAmount, 0),
            orders: undefined,
            _count: undefined,
        }));
        return {
            data: usersWithStats,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        return this.prisma.user.update({
            where: { id },
            data: {
                email: `${user.email}_deleted_${Date.now()}`,
                deletedAt: new Date(),
                isActive: false
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map