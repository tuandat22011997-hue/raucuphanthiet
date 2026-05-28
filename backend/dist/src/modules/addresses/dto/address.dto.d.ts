export declare class CreateAddressDto {
    label?: string;
    fullName: string;
    phone: string;
    address: string;
    isDefault?: boolean;
}
export declare class UpdateAddressDto extends CreateAddressDto {
}
