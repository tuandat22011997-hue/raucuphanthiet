import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateProfile(userId: string, body: {
        name?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        role: string;
    }>;
    findAllCustomers(page?: string, limit?: string, search?: string): Promise<{
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
    updateCustomer(id: string, body: {
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
