import { UserDocument } from '';
interface Metadata {
    ip?: string;
    device?: string;
    userAgent?: string;
}
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
interface AuthResult {
    user: Partial<UserDocument>;
    tokens: TokenPair;
}
interface Session {
    device: string;
    ip: string;
    userAgent: string;
    createdAt: Date;
    expiresAt: Date;
}
interface ResetTokenResult {
    resetToken: string;
    email: string;
    expiresAt: Date;
}
export declare const authenticateUser: (email: string, password: string, metadata?: Metadata) => Promise<AuthResult>;
export declare const refreshUserTokens: (refreshToken: string, metadata?: Metadata) => Promise<TokenPair>;
export declare const logoutUser: (userId: string, refreshToken?: string, metadata?: Partial<Metadata>) => Promise<boolean>;
export declare const logoutAllDevices: (userId: string, metadata?: Partial<Metadata> & {
    reason?: string;
}) => Promise<boolean>;
export declare const getActiveSessions: (userId: string) => Promise<Session[]>;
export declare const changeUserPassword: (userId: string, currentPassword: string, newPassword: string, metadata?: Partial<Metadata>) => Promise<boolean>;
export declare const generatePasswordResetToken: (email: string, metadata?: Partial<Metadata>) => Promise<ResetTokenResult | null>;
export declare const resetPasswordWithToken: (token: string, newPassword: string, metadata?: Partial<Metadata>) => Promise<boolean>;
export declare const getActiveSessionsCount: (userId: string) => Promise<number>;
export {};
//# sourceMappingURL=auth.service.d.ts.map