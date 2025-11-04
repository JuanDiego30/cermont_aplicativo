/**
 * BlacklistedToken Model (TypeScript - November 2025)
 * @description Modelo Mongoose para tokens JWT revocados (blacklist) en CERMONT ATG. Invalida tokens early (logout, breach).
 * TTL auto-delete expired entries. Integra audit logging on revoke. Usa full token (no hash, para exact match).
 * Soporta revoke single/all via jti/versioning (stateless JWT). Optimized indexes para fast check (critical en auth).
 * Uso: await BlacklistedToken.isBlacklisted(token); // Pre-auth check
 *       await BlacklistedToken.revokeToken(token, userId, 'LOGOUT', {ip: req.ip}); // + audit
 * Nota: En jose JWT, usa jti claim para unique; version en User model para all-revoke.
 *       Pre-auth middleware: checkBlacklist -> isBlacklisted. Cleanup old via cron if needed.
 *       Para ATG: Revoke on PASSWORD_CHANGE/ADMIN_REVOKE en auth controller.
 * Pruebas: Jest mock findOne({token}) (true/false), revokeToken invalid decode (false), auto-clean expired (deleteOne), revokeAll increments tokenVersion (User update).
 * Types: Interface BlacklistedTokenDoc (Document), RevokeMetadata (Partial input), BlacklistModel (Model + Statics).
 * Fixes: jwtDecode from 'jose' (decodeJwt deprecated). Statics: async (token: string, userId: ObjectId, ...): Promise<boolean>.
 * Assumes: User model has tokenVersion: number (default 0). AuditData from AuditLog.ts. logger safe.
 * Deps: mongoose ^7+, jose ^5 (jwtDecode). @types/jose if needed (built-in partial).
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { decodeJwt } from 'jose'; // Aligns with jwt.ts (jose for decode)
import { logger } from '../utils/logger';
import AuditLog from './AuditLog'; // For audit on revoke (AuditData interface)

// Enums as const for type safety
const REASONS = [
  'LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'ADMIN_REVOKE',
  'SUSPICIOUS_ACTIVITY', 'ACCOUNT_DISABLED', 'TOKEN_EXPIRED_EARLY', 'TOKEN_REVOKED_ALL',
] as const;
type Reason = typeof REASONS[number];

// Input metadata type (Partial for flexibility)
interface RevokeMetadata {
  ip?: string;
  userAgent?: string;
  revokedBy?: mongoose.Types.ObjectId;
  userEmail?: string;
  method?: string;
  endpoint?: string;
}

// Document interface
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

// Model with statics
interface BlacklistModel extends Model<BlacklistedTokenDoc> {
  isBlacklisted(token: string): Promise<boolean>;
  revokeToken(
    token: string,
    userId: mongoose.Types.ObjectId,
    reason: Reason,
    metadata?: Partial<RevokeMetadata>
  ): Promise<boolean>;
  revokeAllUserTokens(
    userId: mongoose.Types.ObjectId,
    reason: Reason,
    metadata?: Partial<RevokeMetadata>
  ): Promise<boolean>;
  cleanupOld(maxAgeDays?: number): Promise<number>;
}

// BlacklistedToken Schema - Revoked JWTs
const blacklistedTokenSchema: Schema<BlacklistedTokenDoc, BlacklistModel> = new Schema({
  // Full token (exact match for blacklist; truncate if too long? No, full for security)
  token: {
    type: String,
    required: [true, 'Token requerido'],
    unique: true, // Prevent duplicates
    index: true,
  },

  // Associated user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID requerido'],
    index: true,
  },

  // Revocation reason
  reason: {
    type: String,
    required: [true, 'Razón requerida'],
    enum: REASONS,
  },

  // Expiration date (from JWT exp)
  expiresAt: {
    type: Date,
    required: [true, 'Fecha de expiración requerida'],
    index: true,
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Who revoked (admin/user)
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true, // Optional for self-revoke
  },

  // Security context
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
  timestamps: true, // createdAt/updatedAt auto
  strict: true,
  collection: 'blacklistedtokens',
});

// ========================================
// TTL INDEX - Auto-delete expired
// ========================================
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ========================================
// COMPOUND INDEXES
// ========================================
blacklistedTokenSchema.index({ userId: 1, expiresAt: -1 }); // User revokes (recent)
blacklistedTokenSchema.index({ reason: 1, createdAt: -1 }); // Reason trends (audit)
blacklistedTokenSchema.index({ ipAddress: 1, reason: 1 }); // IP abuse (SECURITY_BREACH)

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

/**
 * Check if token is blacklisted (fast, lean)
 * @param token JWT token
 * @returns Promise<boolean>
 */
blacklistedTokenSchema.statics.isBlacklisted = async function (token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const entry: any = await this.findOne({ token }).lean(); // Plain object, fast
    // Check if expired (defense in depth)
    if (entry && entry.expiresAt < new Date()) {
      await this.deleteOne({ _id: entry._id }); // Auto-clean expired
      logger.debug('[Blacklist] Expired token cleaned', { token: `${token.substring(0, 20)}...` });
      return false;
    }
    return !!entry;
  } catch (error: unknown) {
    const errMsg: string = error instanceof Error ? error.message : 'Unknown check error';
    logger.error('[Blacklist] Check failed', { error: errMsg, token: `${token.substring(0, 20)}...` });
    return true; // Fail-closed for security: Assume blacklisted if error
  }
};

/**
 * Revoke single token + audit
 * @param token JWT token
 * @param userId User ID
 * @param reason Revocation reason
 * @param metadata Additional metadata
 * @returns Promise<boolean>
 */
blacklistedTokenSchema.statics.revokeToken = async function (
  token: string,
  userId: mongoose.Types.ObjectId,
  reason: Reason,
  metadata: Partial<RevokeMetadata> = {}
): Promise<boolean> {
  try {
    // Decode with jose (aligns with jwt.ts)
    let decoded: any;
    try {
      decoded = decodeJwt(token); // Throws if invalid
    } catch (decodeErr: unknown) {
      const decMsg: string = decodeErr instanceof Error ? decodeErr.message : 'Decode error';
      logger.warn('[Blacklist] Invalid token decode', { error: decMsg });
      return false;
    }

    if (!decoded || !decoded.exp) {
      logger.warn('[Blacklist] No exp in token', { userId });
      return false;
    }

    const expiresAt: Date = new Date(decoded.exp * 1000);

    // Upsert (if exists, update)
    const entry: BlacklistedTokenDoc = await this.findOneAndUpdate(
      { token },
      {
        userId,
        reason,
        expiresAt,
        metadata: { ...metadata, jti: decoded.jti }, // Include jti if present
        revokedBy: metadata.revokedBy,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Audit revoke (non-blocking)
    AuditLog.log({
      userId,
      userEmail: metadata.userEmail || 'unknown',
      action: 'TOKEN_REVOKED',
      resource: 'Auth',
      description: `Token revoked: ${reason}`,
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
      method: (metadata.method || 'GET') as any,
      endpoint: metadata.endpoint || '/auth/revoke',
      status: entry ? 'SUCCESS' : 'FAILURE',
      severity: reason === 'SECURITY_BREACH' ? 'HIGH' : 'MEDIUM',
      metadata: { reason, tokenPrefix: `${token.substring(0, 20)}...`, jti: decoded.jti } as any,
    }).catch((auditErr: unknown) => {
      const audMsg: string = auditErr instanceof Error ? auditErr.message : 'Audit error';
      logger.error('[Audit] Revoke audit failed', { error: audMsg });
    });

    logger.info('[Blacklist] Token revoked', { userId, reason, expiresAt: expiresAt.toISOString() });
    return true;
  } catch (error: unknown) {
    const errMsg: string = error instanceof Error ? error.message : 'Unknown revoke error';
    logger.error('[Blacklist] Revoke failed', { error: errMsg, userId, reason });
    return false;
  }
};

/**
 * Revoke all user tokens (via version increment; stateless)
 * @param userId User ID
 * @param reason Revocation reason
 * @param metadata Additional metadata
 * @returns Promise<boolean>
 */
blacklistedTokenSchema.statics.revokeAllUserTokens = async function (
  userId: mongoose.Types.ObjectId,
  reason: Reason,
  metadata: Partial<RevokeMetadata> = {}
): Promise<boolean> {
  try {
    const User = mongoose.model('User');
    const user: any = await User.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } }, // Assumes User has tokenVersion: {type: Number, default: 0}
      { new: true }
    );

    if (!user) {
      logger.warn('[Blacklist] User not found for all-revoke', { userId, reason });
      return false;
    }

    // Audit (covers all tokens)
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
      metadata: { reason, oldVersion: user.tokenVersion - 1, newVersion: user.tokenVersion } as any,
    }).catch((auditErr: unknown) => {
      const audMsg: string = auditErr instanceof Error ? auditErr.message : 'Audit error';
      logger.error('[Audit] All-revoke audit failed', { error: audMsg });
    });

    logger.info('[Blacklist] All tokens revoked', { userId, reason, tokenVersion: user.tokenVersion });
    return true;
  } catch (error: unknown) {
    const errMsg: string = error instanceof Error ? error.message : 'Unknown all-revoke error';
    logger.error('[Blacklist] All-revoke failed', { error: errMsg, userId, reason });
    return false;
  }
};

/**
 * Cleanup old blacklisted tokens (cron/scheduled)
 * @param maxAgeDays Max age in days
 * @returns Promise<number>
 */
blacklistedTokenSchema.statics.cleanupOld = async function (maxAgeDays: number = 30): Promise<number> {
  const cutoff: Date = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const result: { deletedCount: number } = await this.deleteMany({ createdAt: { $lt: cutoff } });
  logger.info('[Blacklist] Cleanup completed', { deleted: result.deletedCount, cutoff: cutoff.toISOString() });
  return result.deletedCount;
};

const BlacklistedToken: BlacklistModel = mongoose.model<BlacklistedTokenDoc, BlacklistModel>('BlacklistedToken', blacklistedTokenSchema);

export default BlacklistedToken;
export type BlacklistedTokenDocument = HydratedDocument<BlacklistedTokenDoc>;
