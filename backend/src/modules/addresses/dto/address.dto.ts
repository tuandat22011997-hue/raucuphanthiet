import {
  IsString, IsOptional, IsBoolean, Matches,
} from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  label?: string; // "Nhà", "Công ty"

  @IsString()
  fullName: string;

  @Matches(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}
