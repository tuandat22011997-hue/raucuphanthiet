import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Tính tổng chi tiêu
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

  /** Admin: Xóa khách hàng (soft delete) */
  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    
    return this.prisma.user.update({
      where: { id },
      data: { 
        email: `${user.email}_deleted_${Date.now()}`,
        deletedAt: new Date(), 
        isActive: false 
      }
    });
  }
}
