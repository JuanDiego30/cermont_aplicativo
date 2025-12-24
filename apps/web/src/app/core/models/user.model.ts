export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'administrativo';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    avatar?: string | null;
    active?: boolean;
    lastLogin?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * AuthResponse - Compatible with backend NestJS auth response
 * Backend sends: { token, refreshToken, user }
 */
export interface AuthResponse {
    token?: string;           // Backend field
    access_token?: string;    // Alternative naming
    refreshToken?: string;    // Backend field  
    refresh_token?: string;   // Alternative naming
    user: User;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

