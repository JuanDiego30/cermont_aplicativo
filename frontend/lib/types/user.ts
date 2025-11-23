export enum UserRole {
    ROOT = 'ROOT',
    ADMIN = 'ADMIN',
    COORDINATOR = 'COORDINATOR',
    INSPECTOR = 'INSPECTOR',
    TECHNICIAN = 'TECHNICIAN',
    CLIENT = 'CLIENT',
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    active: boolean;
    mfaEnabled: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface CreateUserDTO {
    email: string;
    name: string;
    role: UserRole;
    password?: string; // Optional because it might be auto-generated or handled separately
}

export interface UpdateUserDTO {
    name?: string;
    role?: UserRole;
    mfaEnabled?: boolean;
}

export interface UserFilters {
    role?: UserRole;
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
