export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ResetPasswordDto {
    email: string;
    phone: string;
    newPassword: string;
}
