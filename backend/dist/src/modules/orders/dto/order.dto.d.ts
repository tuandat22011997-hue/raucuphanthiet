export declare class OrderItemDto {
    productId: string;
    quantity: number;
    note?: string;
}
export declare class CreateOrderDto {
    customerName: string;
    phone: string;
    address: string;
    note?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    couponCode?: string;
    items: OrderItemDto[];
}
export declare class UpdateOrderStatusDto {
    status: 'PENDING' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
    note?: string;
}
export declare class OrderQueryDto {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
