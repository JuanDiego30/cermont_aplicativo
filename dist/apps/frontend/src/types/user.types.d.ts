export interface User {
    _id: string;
    nombre: string;
    email: string;
    cedula: string;
    rol: 'root' | 'admin' | 'coordinator' | 'supervisor' | 'engineer' | 'user';
    telefono?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface LoginResponse {
    user: User;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        message: string;
        code: string;
    };
}
//# sourceMappingURL=user.types.d.ts.map