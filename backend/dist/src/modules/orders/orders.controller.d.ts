import type { Response } from 'express';
import { ExcelService } from '../excel/excel.service';
import { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly excelService;
    constructor(ordersService: OrdersService, excelService: ExcelService);
    create(dto: CreateOrderDto, req: any): Promise<{
        items: ({
            product: {
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
                slug: string;
                description: string | null;
                sortOrder: number;
                isFeatured: boolean;
                nameSearch: string;
                price: number;
                priceWhole: number | null;
                unit: string;
                stock: number;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            note: string | null;
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        customerName: string;
        address: string;
        note: string | null;
        deliveryDate: string | null;
        deliveryTime: string | null;
        status: string;
        totalAmount: number;
        couponCode: string | null;
        discountAmount: number;
        userId: string | null;
    }>;
    findMyOrders(userId: string, page?: string, limit?: string): Promise<{
        data: ({
            items: ({
                product: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    slug: string;
                    unit: string;
                    stock: number;
                    images: {
                        id: string;
                        createdAt: Date;
                        sortOrder: number;
                        url: string;
                        altText: string | null;
                        productId: string;
                    }[];
                };
            } & {
                id: string;
                createdAt: Date;
                price: number;
                note: string | null;
                quantity: number;
                productId: string;
                orderId: string;
            })[];
        } & {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            customerName: string;
            address: string;
            note: string | null;
            deliveryDate: string | null;
            deliveryTime: string | null;
            status: string;
            totalAmount: number;
            couponCode: string | null;
            discountAmount: number;
            userId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getDashboardStats(): Promise<{
        todayOrders: number;
        todayRevenue: number;
        pendingOrders: number;
        totalOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        recentOrders: ({
            user: {
                name: string;
            } | null;
        } & {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            customerName: string;
            address: string;
            note: string | null;
            deliveryDate: string | null;
            deliveryTime: string | null;
            status: string;
            totalAmount: number;
            couponCode: string | null;
            discountAmount: number;
            userId: string | null;
        })[];
    }>;
    findAll(query: OrderQueryDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            } | null;
            items: ({
                product: {
                    name: string;
                    unit: string;
                    images: {
                        id: string;
                        createdAt: Date;
                        sortOrder: number;
                        url: string;
                        altText: string | null;
                        productId: string;
                    }[];
                };
            } & {
                id: string;
                createdAt: Date;
                price: number;
                note: string | null;
                quantity: number;
                productId: string;
                orderId: string;
            })[];
        } & {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            customerName: string;
            address: string;
            note: string | null;
            deliveryDate: string | null;
            deliveryTime: string | null;
            status: string;
            totalAmount: number;
            couponCode: string | null;
            discountAmount: number;
            userId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, req: any): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
        } | null;
        items: ({
            product: {
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
                slug: string;
                description: string | null;
                sortOrder: number;
                isFeatured: boolean;
                nameSearch: string;
                price: number;
                priceWhole: number | null;
                unit: string;
                stock: number;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            note: string | null;
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        customerName: string;
        address: string;
        note: string | null;
        deliveryDate: string | null;
        deliveryTime: string | null;
        status: string;
        totalAmount: number;
        couponCode: string | null;
        discountAmount: number;
        userId: string | null;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                description: string | null;
                sortOrder: number;
                isFeatured: boolean;
                nameSearch: string;
                price: number;
                priceWhole: number | null;
                unit: string;
                stock: number;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            note: string | null;
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        customerName: string;
        address: string;
        note: string | null;
        deliveryDate: string | null;
        deliveryTime: string | null;
        status: string;
        totalAmount: number;
        couponCode: string | null;
        discountAmount: number;
        userId: string | null;
    }>;
    exportSingle(id: string, res: Response, req: any): Promise<void>;
    exportBulk(ids: string[], res: Response): Promise<void>;
    deleteOrder(id: string): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        customerName: string;
        address: string;
        note: string | null;
        deliveryDate: string | null;
        deliveryTime: string | null;
        status: string;
        totalAmount: number;
        couponCode: string | null;
        discountAmount: number;
        userId: string | null;
    }>;
}
