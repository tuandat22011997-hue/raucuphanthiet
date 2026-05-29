import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** PATCH /api/v1/users/profile - Cập nhật thông tin cá nhân */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { name?: string; phone?: string },
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  /** GET /api/v1/users/customers - Danh sách khách hàng (Admin) */
  @Get('customers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAllCustomers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  /** PATCH /api/v1/users/:id - Cập nhật khách hàng (Admin) */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateCustomer(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; phone?: string; password?: string; isActive?: boolean },
  ) {
    return this.usersService.updateCustomer(id, body);
  }

  /** DELETE /api/v1/users/:id - Xóa người dùng (Admin) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
