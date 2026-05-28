import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { ExcelService } from '../excel/excel.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
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
            };
        } & {
            id: string;
            createdAt: Date;
            note: string | null;
            price: number;
            productId: string;
            quantity: number;
            orderId: string;
        })[];
    } & {
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        orderNumber: string;
        customerName: string;
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
                    unit: string;
                    slug: string;
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
                note: string | null;
                price: number;
                productId: string;
                quantity: number;
                orderId: string;
            })[];
        } & {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            orderNumber: string;
            customerName: string;
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
            address: string;
            orderNumber: string;
            customerName: string;
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
                note: string | null;
                price: number;
                productId: string;
                quantity: number;
                orderId: string;
            })[];
        } & {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            orderNumber: string;
            customerName: string;
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
            };
        } & {
            id: string;
            createdAt: Date;
            note: string | null;
            price: number;
            productId: string;
            quantity: number;
            orderId: string;
        })[];
    } & {
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        orderNumber: string;
        customerName: string;
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
            };
        } & {
            id: string;
            createdAt: Date;
            note: string | null;
            price: number;
            productId: string;
            quantity: number;
            orderId: string;
        })[];
    } & {
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        orderNumber: string;
        customerName: string;
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
        address: string;
        orderNumber: string;
        customerName: string;
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
