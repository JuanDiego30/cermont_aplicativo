import { LoginCredentials, LoginResponse, User } from '@/types/user.types';
export declare const authService: {
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    forgotPassword(email: string): Promise<null | {
        resetToken?: string;
    }>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map