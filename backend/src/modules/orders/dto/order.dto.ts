import {
  IsString, IsArray, ValidateNested, IsNumber,
  IsOptional, Min, IsDateString, ArrayMinSize,
  Matches, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

export class CreateOrderDto {
  @IsString({ message: 'Họ tên không hợp lệ' })
  customerName: string;

  @Matches(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsString({ message: 'Địa chỉ không hợp lệ' })
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsString()
  deliveryDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  deliveryTime?: string; // VD: "08:00-10:00"

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Giỏ hàng trống' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsString()
  status: 'PENDING' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  note?: string;
}

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  search?: string;       // Tìm theo mã đơn, tên, số điện thoại

  @IsOptional()
  @IsString()
  status?: string;       // Lọc theo trạng thái

  @IsOptional()
  @IsString()
  dateFrom?: string;     // Từ ngày YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateTo?: string;       // Đến ngày YYYY-MM-DD

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
}
