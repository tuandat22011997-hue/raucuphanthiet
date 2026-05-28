import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { generateOrderNumber } from '../../common/utils/helpers.util';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo đơn hàng mới
   * - Kiểm tra tồn kho từng sản phẩm
   * - Tính giá theo giá hiện tại
   * - Trừ kho sau khi đặt thành công
   */
  async create(dto: CreateOrderDto, userId?: string) {
    // 1. Lấy thông tin các sản phẩm trong đơn
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isActive: true },
    });

    // 2. Kiểm tra sản phẩm còn hàng và đủ số lượng
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(
          `Sản phẩm không tồn tại hoặc đã ngừng bán`,
        );
      }
      // Vô hiệu hóa kiểm tra tồn kho để hỗ trợ Đặt hàng trước (Pre-order)
      // if (product.stock < item.quantity) {
      //   throw new BadRequestException(
      //     `Sản phẩm "${product.name}" chỉ còn ${product.stock} ${product.unit}`,
      //   );
      // }
    }

    // 3. Tính tổng tiền
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Giá tại thời điểm đặt
        note: item.note,
      };
    });

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 4. Xử lý coupon (nếu có)
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
              // Tăng usedCount
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
    const orderNumber = generateOrderNumber();

    // 5. Tạo đơn hàng trong transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Tạo đơn
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

      // Trừ kho từng sản phẩm
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        // Ghi log xuất kho
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

  /** Lấy danh sách đơn hàng (Admin) với filter */
  async findAll(query: OrderQueryDto) {
    const {
      search,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (status) where.status = status;

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

  /** Lấy đơn hàng của khách hàng đang đăng nhập */
  async findMyOrders(userId: string, page = 1, limit = 10) {
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

  /** Lấy chi tiết 1 đơn hàng */
  async findById(id: string) {
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
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  /** Cập nhật trạng thái đơn hàng (Admin) */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findById(id);

    // Nếu hủy đơn, hoàn lại tồn kho
    if (dto.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: { status: dto.status as any },
        });

        // Hoàn lại kho
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
      data: { status: dto.status as any },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  /** Thống kê dashboard */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayOrders,
      todayRevenue,
      pendingOrders,
      totalOrders,
      totalRevenue,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      // Đơn hôm nay
      this.prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      // Doanh thu hôm nay
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { in: ['COMPLETED', 'DELIVERING'] },
        },
        _sum: { totalAmount: true },
      }),
      // Đơn đang xử lý
      this.prisma.order.count({
        where: { status: { in: ['PENDING', 'PREPARING'] } },
      }),
      // Tổng đơn
      this.prisma.order.count(),
      // Tổng doanh thu
      this.prisma.order.aggregate({
        where: { status: { in: ['COMPLETED', 'DELIVERING'] } },
        _sum: { totalAmount: true },
      }),
      // Tổng khách hàng
      this.prisma.user.count({
        where: { role: 'CUSTOMER', deletedAt: null },
      }),
      // Đơn hàng gần đây
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

  /** Xóa đơn hàng (Admin) */
  async deleteOrder(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // Due to onDelete: Cascade on order items, we just need to delete the order
    return this.prisma.order.delete({ where: { id } });
  }
}
