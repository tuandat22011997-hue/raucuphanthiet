import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Bảo mật với Helmet
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS cho frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation pipe toàn cục - chống XSS và validate input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Loại bỏ field không khai báo trong DTO
      forbidNonWhitelisted: true,
      transform: true,          // Tự động transform kiểu dữ liệu
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Áp dụng ResponseInterceptor cho toàn bộ các route
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Serve static files (ảnh upload)
  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'uploads'), {
      maxAge: '7d', // Cache ảnh 7 ngày
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Backend đang chạy tại: http://localhost:${port}/api/v1`);
  logger.log(`📁 Upload files: http://localhost:${port}/uploads`);
}
bootstrap();
