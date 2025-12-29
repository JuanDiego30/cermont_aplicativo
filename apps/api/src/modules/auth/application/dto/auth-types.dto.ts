export interface AuthContext {
    ip?: string;
    userAgent?: string;
}

export interface TokenResponse {
    token: string;
    refreshToken: string;
    expiresIn?: number;
}

export interface MeResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface LogoutResponse {
    message: string;
}
