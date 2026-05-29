"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
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
    async updateCustomer(id, data) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user || user.deletedAt) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        if (user.role !== 'CUSTOMER') {
            throw new common_1.NotFoundException('Không tìm thấy khách hàng');
        }
        const normalizedEmail = data.email?.trim().toLowerCase();
        if (normalizedEmail && normalizedEmail !== user.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email: normalizedEmail,
                    id: { not: id },
                    deletedAt: null,
                },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email đã được sử dụng');
            }
        }
        const normalizedPassword = data.password?.trim();
        const hashedPassword = normalizedPassword && normalizedPassword.length > 0
            ? await bcrypt.hash(normalizedPassword, 12)
            : undefined;
        return this.prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(hashedPassword !== undefined ? { password: hashedPassword } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
            },
        });
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
                isActive: false,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map