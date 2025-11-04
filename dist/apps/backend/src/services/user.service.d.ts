interface CreateUserDto {
    nombre: string;
    email: string;
    password: string;
    rol: UserRole;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
}
interface UpdateUserDto {
    nombre?: string;
    email?: string;
    rol?: UserRole;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
    activo?: boolean;
}
interface ListFilters {
    search?: string;
    rol?: UserRole;
    activo?: boolean;
    fechaDesde?: Date;
    fechaHasta?: Date;
    cedula?: string;
}
interface ListOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}
interface UserStats {
    total: number;
    activos: number;
    inactivos: number;
    porRol: Array<{
        _id: UserRole;
        count: number;
        activos: number;
    }>;
}
interface UserService {
    list: (filters?: ListFilters, options?: ListOptions) => Promise<any>;
    getById: (userId: string) => Promise<any>;
    getByEmail: (email: string) => Promise<any>;
    create: (userData: CreateUserDto, creatorId?: string) => Promise<any>;
    update: (userId: string, updateData: UpdateUserDto, updaterId?: string) => Promise<any>;
    delete: (userId: string, deleterId?: string) => Promise<any>;
    changePassword: (userId: string, currentPassword: string, newPassword: string, changerId?: string) => Promise<boolean>;
    getStats: (filters?: Partial<ListFilters>) => Promise<UserStats>;
}
declare class UserService implements UserService {
    list(filters?: ListFilters, options?: ListOptions): Promise<any>;
    getById(userId: string): Promise<any>;
    getByEmail(email: string): Promise<any>;
    create(userData: CreateUserDto, creatorId?: string): Promise<any>;
    update(userId: string, updateData: UpdateUserDto, updaterId?: string): Promise<any>;
    delete(userId: string, deleterId?: string): Promise<any>;
    changePassword(userId: string, currentPassword: string, newPassword: string, changerId?: string): Promise<boolean>;
    getStats(filters?: Partial<ListFilters>): Promise<UserStats>;
    private getMonthStart;
}
declare const _default: UserService;
export default _default;
export type { CreateUserDto, UpdateUserDto, ListFilters, ListOptions, UserStats, UserService };
//# sourceMappingURL=user.service.d.ts.map