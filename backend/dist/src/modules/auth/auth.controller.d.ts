import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
            role: string;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
            role: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        name: string;
        role: string;
        createdAt: Date;
        addresses: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            label: string | null;
            fullName: string;
            isDefault: boolean;
            userId: string;
        }[];
        _count: {
            orders: number;
        };
    }>;
}
