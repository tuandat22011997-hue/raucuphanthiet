import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFiles, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// Cấu hình multer để lưu ảnh local
const multerConfig = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'products'),
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)'), false);
    }
    cb(null, true);
  },
};

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** GET /api/v1/products - Danh sách sản phẩm (public) */
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  /** GET /api/v1/products/search?q=... - Tìm kiếm realtime (public) */
  @Get('search')
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.productsService.search(q, limit ? parseInt(limit) : 10);
  }

  /** GET /api/v1/products/top-selling - Sản phẩm bán chạy (Admin) */
  @Get('top-selling')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getTopSelling(@Query('limit') limit?: string) {
    return this.productsService.getTopSelling(limit ? parseInt(limit) : 10);
  }

  /** GET /api/v1/products/:slug - Chi tiết sản phẩm (public) */
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  /** POST /api/v1/products - Tạo sản phẩm (Admin, kèm ảnh) */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageUrls = files?.map(
      (f) => `/uploads/products/${f.filename}`,
    ) || [];
    return this.productsService.create(dto, imageUrls);
  }

  /** PUT /api/v1/products/:id - Cập nhật sản phẩm (Admin) */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageUrls = files?.map((f) => `/uploads/products/${f.filename}`);
    return this.productsService.update(id, dto, imageUrls);
  }

  /** DELETE /api/v1/products/:id - Xóa sản phẩm (Admin) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
