import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.prisma.siteSetting.findMany();
    const result: Record<string, string> = {};

    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  }

  async updateMany(data: Record<string, string>): Promise<Record<string, string>> {
    const entries = Object.entries(data ?? {})
      .filter(([key]) => typeof key === 'string' && key.trim().length > 0)
      .map(([key, value]) => [key.trim(), value == null ? '' : String(value)] as const);

    if (entries.length === 0) {
      return this.getAll();
    }

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return this.getAll();
  }
}
