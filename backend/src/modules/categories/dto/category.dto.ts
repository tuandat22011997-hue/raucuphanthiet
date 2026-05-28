import { IsString, IsOptional, IsNumber, Min, IsBoolean, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString({ message: 'Tên danh mục không hợp lệ' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends CreateCategoryDto {
}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activeOnly?: boolean;
}
