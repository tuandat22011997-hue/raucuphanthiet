import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Cập nhật thông tin profile */
  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  }

  /** Admin: Lấy danh sách khách hàng */
  async findAllCustomers(page = 1, limit = 20, search?: string) {
    const where: any = {
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

  /** Admin: Cập nhật khách hàng */
  async updateCustomer(
    id: string,
    data: { name?: string; email?: string; phone?: string; password?: string; isActive?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    if (user.role !== 'CUSTOMER') {
      throw new NotFoundException('Không tìm thấy khách hàng');
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
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    const normalizedPassword = data.password?.trim();
    const hashedPassword =
      normalizedPassword && normalizedPassword.length > 0
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

  /** Admin: Xóa khách hàng (soft delete) */
  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    return this.prisma.user.update({
      where: { id },
      data: {
        email: `${user.email}_deleted_${Date.now()}`,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
