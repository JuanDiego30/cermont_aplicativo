import mongoose, { Document, Model } from 'mongoose';
declare const REASONS: readonly ["LOGOUT", "PASSWORD_CHANGE", "SECURITY_BREACH", "ADMIN_REVOKE", "SUSPICIOUS_ACTIVITY", "ACCOUNT_DISABLED", "TOKEN_EXPIRED_EARLY"];
type Reason = typeof REASONS[number];
interface RevokeMetadata {
    ip?: string;
    userAgent?: string;
    revokedBy?: mongoose.Types.ObjectId;
    userEmail?: string;
    method?: string;
    endpoint?: string;
}
interface BlacklistedTokenDoc extends Document {
    token: string;
    userId: mongoose.Types.ObjectId;
    reason: Reason;
    expiresAt: Date;
    metadata?: mongoose.Schema.Types.Mixed;
    revokedBy?: mongoose.Types.ObjectId;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface BlacklistModel extends Model<BlacklistedTokenDoc> {
    isBlacklisted(token: string): Promise<boolean>;
    revokeToken(token: string, userId: mongoose.Types.ObjectId, reason: Reason, metadata?: Partial<RevokeMetadata>): Promise<boolean>;
    revokeAllUserTokens(userId: mongoose.Types.ObjectId, reason: Reason, metadata?: Partial<RevokeMetadata>): Promise<boolean>;
    cleanupOld(maxAgeDays?: number): Promise<number>;
}
declare const BlacklistedToken: BlacklistModel;
export default BlacklistedToken;
//# sourceMappingURL=BlacklistedToken.d.ts.map