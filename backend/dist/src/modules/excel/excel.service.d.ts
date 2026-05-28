export declare class ExcelService {
    exportSingleOrder(order: any): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    exportMultipleOrders(orders: any[]): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    private buildOrderSheet;
}
