import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus, Res, Request, ForbiddenException
} from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { ExcelService } from '../excel/excel.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly excelService: ExcelService,
  ) {}

  /**
   * POST /api/v1/orders - Tạo đơn hàng
   * Không bắt buộc đăng nhập (hỗ trợ cả khách vãng lai)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.ordersService.create(dto, userId);
  }

  /** GET /api/v1/orders/my - Đơn hàng của tôi */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findMyOrders(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /** GET /api/v1/orders/dashboard-stats - Thống kê admin */
  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  /** GET /api/v1/orders - Tất cả đơn hàng (Admin) */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  /** GET /api/v1/orders/:id - Chi tiết đơn hàng */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string, @Request() req: any) {
    const order = await this.ordersService.findById(id);
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  /** PATCH /api/v1/orders/:id/status - Cập nhật trạng thái (Admin) */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  /**
   * GET /api/v1/orders/:id/export - Xuất Excel 1 đơn hàng (Admin)
   * Tải file: TenKhachHang_DD-MM-YYYY.xlsx
   */
  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  async exportSingle(@Param('id') id: string, @Res() res: Response, @Request() req: any) {
    const order = await this.ordersService.findById(id);
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      throw new ForbiddenException('Bạn không có quyền xuất file đơn hàng này');
    }
    const { buffer, filename } = await this.excelService.exportSingleOrder(order);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  }

  /**
   * POST /api/v1/orders/export-bulk - Xuất Excel nhiều đơn (Admin)
   */
  @Post('export-bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async exportBulk(@Body('ids') ids: string[], @Res() res: Response) {
    const orders = await Promise.all(ids.map((id) => this.ordersService.findById(id)));
    const { buffer, filename } = await this.excelService.exportMultipleOrders(orders);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.send(buffer);
  }

  /** DELETE /api/v1/orders/:id - Xóa đơn hàng (Admin) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
