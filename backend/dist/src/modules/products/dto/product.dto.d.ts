export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    priceWhole?: number;
    unit: string;
    stock: number;
    categoryId: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
}
export declare class UpdateProductDto extends CreateProductDto {
}
export declare class ProductQueryDto {
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    inStock?: boolean;
    featured?: boolean;
    activeOnly?: boolean;
}
