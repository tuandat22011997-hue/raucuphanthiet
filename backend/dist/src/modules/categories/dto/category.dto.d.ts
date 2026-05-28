export declare class CreateCategoryDto {
    name: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class UpdateCategoryDto extends CreateCategoryDto {
}
export declare class CategoryQueryDto {
    search?: string;
    activeOnly?: boolean;
}
