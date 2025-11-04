import mongoose, { Document, Model, Types } from 'mongoose';
export interface IUser extends Document {
    _id: Types.ObjectId;
    nombre: string;
    email: string;
    password: string;
    rol: string;
    telefono?: string;
    cedula?: string;
    cargo?: string;
    especialidad?: string;
    isActive: boolean;
    isLocked: boolean;
    lockUntil?: Date;
    loginAttempts: number;
    lastLoginIP?: string;
    tokenVersion: number;
    refreshTokens: Array<{
        token: string;
        expiresAt: Date;
        device: string;
        ip: string;
        userAgent: string;
        createdAt: Date;
    }>;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface IUserModel extends Model<IUser, {}, IUserMethods> {
    comparePasswordStatic(password: string, hash: string): Promise<boolean>;
    incrementLoginAttempts(userId: Types.ObjectId): Promise<void>;
    resetLoginAttempts(userId: Types.ObjectId, ip: string): Promise<void>;
    addRefreshTokenStatic(userId: Types.ObjectId, token: string, expiresAt: Date, deviceInfo: any): Promise<void>;
    removeRefreshTokenStatic(userId: Types.ObjectId, token: string): Promise<void>;
    invalidateAllTokensStatic(userId: Types.ObjectId): Promise<void>;
    hasValidRefreshTokenStatic(user: IUser, token: string): boolean;
}
declare const User: IUserModel;
export default User;
interface UserDoc extends Document {
    nombre: any;
    apellido?: any;
    email: any;
    password: any;
    rol: any;
    telefono?: any;
    cedula?: any;
    cargo?: any;
    especialidad?: any;
    avatar?: any;
    isActive: any;
    tokenVersion: any;
    refreshTokens: any[];
    loginAttempts: any;
    lockUntil?: any;
    lastLogin?: any;
    lastLoginIp?: any;
    lastPasswordChange: any;
    securityLog: any[];
    refreshToken?: any;
    passwordResetToken?: any;
    passwordResetExpires?: any;
    createdBy?: any;
    updatedBy?: any;
    createdAt: any;
    updatedAt: any;
    nombreCompleto: any;
    iniciales: any;
    isLocked: any;
    comparePassword(candidatePassword: any): Promise<boolean>;
    toAuthJSON(): any;
    hasRole(role: any): boolean;
    hasMinRole(minRole: any): boolean;
    incrementLoginAttempts(ip?: any): Promise<UserDoc>;
    resetLoginAttempts(ip?: any): Promise<UserDoc>;
    invalidateAllTokens(performerId?: any, ip?: any): Promise<HydratedDocument<UserDoc>>;
    addRefreshToken(token: any, expiresAt: any, device?: any, ip?: any, userAgent?: any): Promise<HydratedDocument<UserDoc>>;
    removeRefreshToken(token: any): Promise<HydratedDocument<UserDoc>>;
    hasValidRefreshToken(token: any): boolean;
}
interface UserModel extends Model<UserDoc> {
    findByEmail(email: string): Promise<UserDoc | null>;
    findByRole(role: Rol, options?: {
        page?: number;
        limit?: number;
    }): Promise<UserDoc[]>;
    findActive(options?: {
        page?: number;
        limit?: number;
        especialidad?: string;
    }): Promise<UserDoc[]>;
    search(query: string, options?: {
        page?: number;
        limit?: number;
        rol?: Rol;
    }): Promise<UserDoc[]>;
    getStats(): Promise<any[]>;
    getByEspecialidad(especialidad: string): Promise<UserDoc[]>;
    getMisOrdenes(userId: mongoose.Types.ObjectId): Promise<UserDoc['misOrdenes']>;
    comparePasswordStatic(plainPassword: string, hashedPassword: string): Promise<boolean>;
    incrementLoginAttempts(userId: mongoose.Types.ObjectId): Promise<UserDoc>;
    resetLoginAttempts(userId: mongoose.Types.ObjectId, ip?: string): Promise<UserDoc>;
    addRefreshTokenStatic(userId: mongoose.Types.ObjectId, token: string, expiresAt: Date, metadata?: Record<string, any>): Promise<HydratedDocument<UserDoc>>;
    removeRefreshTokenStatic(userId: mongoose.Types.ObjectId, token: string): Promise<HydratedDocument<UserDoc>>;
    hasValidRefreshTokenStatic(user: UserDoc, token: string): boolean;
    invalidateAllTokensStatic(userId: mongoose.Types.ObjectId): Promise<HydratedDocument<UserDoc>>;
}
export default User;
export type IUserDoc = UserDoc;
export type IUserModel = UserModel;
//# sourceMappingURL=User.d.ts.map