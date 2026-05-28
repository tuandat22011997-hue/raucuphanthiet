import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UploadModule } from './modules/upload/upload.module';
import { ExcelModule } from './modules/excel/excel.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // Config module - đọc .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting - chống spam
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,      // 1 giây
        limit: 10,      // tối đa 10 request
      },
      {
        name: 'medium',
        ttl: 60000,     // 1 phút
        limit: 100,     // tối đa 100 request
      },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    UploadModule,
    ExcelModule,
    AddressesModule,
    SettingsModule,
  ],
})
export class AppModule {}
