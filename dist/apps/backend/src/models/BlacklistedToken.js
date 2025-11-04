import mongoose, { Schema } from 'mongoose';
import { jwtDecode } from 'jose';
import { logger } from '';
import AuditLog from '';
const REASONS = [
    'LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'ADMIN_REVOKE',
    'SUSPICIOUS_ACTIVITY', 'ACCOUNT_DISABLED', 'TOKEN_EXPIRED_EARLY',
];
const blacklistedTokenSchema = new Schema({
    token: {
        type: String,
        required: [true, 'Token requerido'],
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID requerido'],
        index: true,
    },
    reason: {
        type: String,
        required: [true, 'Razón requerida'],
        enum: REASONS,
    },
    expiresAt: {
        type: Date,
        required: [true, 'Fecha de expiración requerida'],
        index: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true,
    },
    ipAddress: {
        type: String,
        trim: true,
        maxlength: [45, 'IP inválida'],
    },
    userAgent: {
        type: String,
        maxlength: [500, 'User-Agent demasiado largo'],
    },
}, {
    timestamps: true,
    strict: true,
    collection: 'blacklistedtokens',
});
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
blacklistedTokenSchema.index({ userId: 1, expiresAt: -1 });
blacklistedTokenSchema.index({ reason: 1, createdAt: -1 });
blacklistedTokenSchema.index({ ipAddress: 1, reason: 1 });
blacklistedTokenSchema.statics.isBlacklisted = async function (token) {
    if (!token)
        return false;
    try {
        const entry = await this.findOne({ token }).lean();
        if (entry && entry.expiresAt < new Date()) {
            await this.deleteOne({ _id: entry._id });
            logger.debug('[Blacklist] Expired token cleaned', { token: `${token.substring(0, 20)}...` });
            return false;
        }
        return !!entry;
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown check error';
        logger.error('[Blacklist] Check failed', { error: errMsg, token: `${token.substring(0, 20)}...` });
        return true;
    }
};
blacklistedTokenSchema.statics.revokeToken = async function (token, userId, reason, metadata = {}) {
    try {
        let decoded;
        try {
            decoded = jwtDecode(token);
        }
        catch (decodeErr) {
            const decMsg = decodeErr instanceof Error ? decodeErr.message : 'Decode error';
            logger.warn('[Blacklist] Invalid token decode', { error: decMsg });
            return false;
        }
        if (!decoded || !decoded.exp) {
            logger.warn('[Blacklist] No exp in token', { userId });
            return false;
        }
        const expiresAt = new Date(decoded.exp * 1000);
        const entry = await this.findOneAndUpdate({ token }, {
            userId,
            reason,
            expiresAt,
            metadata: { ...metadata, jti: decoded.jti },
            revokedBy: metadata.revokedBy,
            ipAddress: metadata.ip,
            userAgent: metadata.userAgent,
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        AuditLog.log({
            userId,
            userEmail: metadata.userEmail || 'unknown',
            action: 'TOKEN_REVOKED',
            resource: 'Auth',
            description: `Token revoked: ${reason}`,
            ipAddress: metadata.ip,
            userAgent: metadata.userAgent,
            method: metadata.method || 'N/A',
            endpoint: metadata.endpoint || '/auth/revoke',
            status: entry ? 'SUCCESS' : 'FAILURE',
            severity: reason === 'SECURITY_BREACH' ? 'HIGH' : 'MEDIUM',
            metadata: { reason, tokenPrefix: `${token.substring(0, 20)}...`, jti: decoded.jti },
        }).catch((auditErr) => {
            const audMsg = auditErr instanceof Error ? auditErr.message : 'Audit error';
            logger.error('[Audit] Revoke audit failed', { error: audMsg });
        });
        logger.info('[Blacklist] Token revoked', { userId, reason, expiresAt: expiresAt.toISOString() });
        return true;
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown revoke error';
        logger.error('[Blacklist] Revoke failed', { error: errMsg, userId, reason });
        return false;
    }
};
blacklistedTokenSchema.statics.revokeAllUserTokens = async function (userId, reason, metadata = {}) {
    try {
        const User = mongoose.model('User');
        const user = await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true });
        if (!user) {
            logger.warn('[Blacklist] User not found for all-revoke', { userId, reason });
            return false;
        }
        AuditLog.log({
            userId,
            userEmail: user.email,
            action: 'TOKEN_REVOKED_ALL',
            resource: 'Auth',
            description: `All tokens revoked: ${reason}`,
            ipAddress: metadata.ip,
            userAgent: metadata.userAgent,
            status: 'SUCCESS',
            severity: reason === 'SECURITY_BREACH' ? 'HIGH' : 'MEDIUM',
            metadata: { reason, oldVersion: user.tokenVersion - 1, newVersion: user.tokenVersion },
        }).catch((auditErr) => {
            const audMsg = auditErr instanceof Error ? auditErr.message : 'Audit error';
            logger.error('[Audit] All-revoke audit failed', { error: audMsg });
        });
        logger.info('[Blacklist] All tokens revoked', { userId, reason, tokenVersion: user.tokenVersion });
        return true;
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown all-revoke error';
        logger.error('[Blacklist] All-revoke failed', { error: errMsg, userId, reason });
        return false;
    }
};
blacklistedTokenSchema.statics.cleanupOld = async function (maxAgeDays = 30) {
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const result = await this.deleteMany({ createdAt: { $lt: cutoff } });
    logger.info('[Blacklist] Cleanup completed', { deleted: result.deletedCount, cutoff: cutoff.toISOString() });
    return result.deletedCount;
};
const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
export default BlacklistedToken;
//# sourceMappingURL=BlacklistedToken.js.map