import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        role: string;
    }>;
    findAllCustomers(page?: number, limit?: number, search?: string): Promise<{
        data: {
            totalOrders: number;
            totalSpent: number;
            orders: undefined;
            _count: undefined;
            id: string;
            email: string;
            phone: string | null;
            name: string;
            isActive: boolean;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateCustomer(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        role: string;
        isActive: boolean;
    }>;
    deleteUser(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        password: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
