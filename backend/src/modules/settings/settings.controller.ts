import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings - Lấy tất cả settings (public)
   */
  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  /**
   * PUT /api/v1/settings - Cập nhật settings (Admin only)
   */
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Body() data: Record<string, string>) {
    return this.settingsService.updateMany(data);
  }
}
