import {
  IsString, IsNumber, IsOptional, IsBoolean,
  Min, MaxLength, IsArray, ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm không hợp lệ' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber({}, { message: 'Giá không hợp lệ' })
  @Min(0, { message: 'Giá không được âm' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceWhole?: number;

  @IsString({ message: 'Đơn vị không hợp lệ' })
  unit: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateProductDto extends CreateProductDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.length > 0) return [value];
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  retainedImageUrls?: string[];
}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string;      // Tìm kiếm theo tên

  @IsOptional()
  @IsString()
  categoryId?: string;  // Lọc theo danh mục

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;      // 'price_asc' | 'price_desc' | 'name' | 'newest'

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean;    // Chỉ hiện còn hàng

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;   // Chỉ hiện nổi bật

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activeOnly?: boolean;
}
