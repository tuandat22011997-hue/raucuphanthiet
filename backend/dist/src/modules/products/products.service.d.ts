import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: ProductQueryDto): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            images: {
                id: string;
                createdAt: Date;
                sortOrder: number;
                url: string;
                altText: string | null;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            isFeatured: boolean;
            description: string | null;
            sortOrder: number;
            unit: string;
            slug: string;
            categoryId: string;
            price: number;
            priceWhole: number | null;
            stock: number;
            nameSearch: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    search(q: string, limit?: number): Promise<{
        id: string;
        name: string;
        unit: string;
        slug: string;
        price: number;
        stock: number;
        images: {
            url: string;
        }[];
    }[]>;
    findBySlug(slug: string): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            slug: string;
        };
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            url: string;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isFeatured: boolean;
        description: string | null;
        sortOrder: number;
        unit: string;
        slug: string;
        categoryId: string;
        price: number;
        priceWhole: number | null;
        stock: number;
        nameSearch: string;
    }>;
    findById(id: string): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            slug: string;
        };
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            url: string;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isFeatured: boolean;
        description: string | null;
        sortOrder: number;
        unit: string;
        slug: string;
        categoryId: string;
        price: number;
        priceWhole: number | null;
        stock: number;
        nameSearch: string;
    }>;
    create(dto: CreateProductDto, imageUrls?: string[]): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            slug: string;
        };
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            url: string;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isFeatured: boolean;
        description: string | null;
        sortOrder: number;
        unit: string;
        slug: string;
        categoryId: string;
        price: number;
        priceWhole: number | null;
        stock: number;
        nameSearch: string;
    }>;
    update(id: string, dto: UpdateProductDto, imageUrls?: string[]): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            slug: string;
        };
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            url: string;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isFeatured: boolean;
        description: string | null;
        sortOrder: number;
        unit: string;
        slug: string;
        categoryId: string;
        price: number;
        priceWhole: number | null;
        stock: number;
        nameSearch: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        isFeatured: boolean;
        description: string | null;
        sortOrder: number;
        unit: string;
        slug: string;
        categoryId: string;
        price: number;
        priceWhole: number | null;
        stock: number;
        nameSearch: string;
    }>;
    getTopSelling(limit?: number): Promise<{
        totalSold: number;
        id: string;
        name: string;
        unit: string;
        price: number;
        images: {
            id: string;
            createdAt: Date;
            sortOrder: number;
            url: string;
            altText: string | null;
            productId: string;
        }[];
    }[]>;
}
