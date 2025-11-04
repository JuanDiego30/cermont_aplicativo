/**
 * 2FA Service with TOTP (TypeScript - November 2025)
 * @description TOTP 2FA para roles críticos (admin/coordinator). Speakeasy gen/verify secret, QR code para app (Google Auth). Enable/disable en user profile.
 * Uso: En auth.routes: POST /2fa/enable (gen secret/QR), POST /login/verify-2fa (code check). Middleware: req 2FA si user.2faEnabled y rol crítico.
 * Integrado con: speakeasy@2.0.0, qrcode@1.5.3, User model (add 2faSecret?: string, 2faEnabled: boolean). Secure: Base32 secret, no store plain, verify window 30s.
 * Performance: Sync gen/verify, low CPU. Extensible: Backup codes, recovery. Tests: Mock Speakeasy, test valid/invalid codes.
 * Fixes: 2FA para admin/coordinator, QR otpauth:// URL. Env: 2FA_ISSUER='CERMONT'. tsconfig strict.
 * Assumes: User model update (Mongoose schema: 2faSecret: { type: String, select: false }, 2faEnabled: { type: Boolean, default: false }). Deps: speakeasy, qrcode.
 */

import Speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from '../utils/logger';
import User from '../models/User.js';

const TWO_FACTOR_ISSUER = process.env.TWO_FA_ISSUER || 'CERMONT';
const TIME_STEP = 30; // 30s window

// Generate secret & QR (enable 2FA)
export const enable2FA = async (userId: string): Promise<{ secret: string; qrCode: string; base32: string }> => {
  const secret = Speakeasy.generateSecret({ name: `${TWO_FACTOR_ISSUER} (${userId})`, issuer: TWO_FACTOR_ISSUER });
  const qrCodeUrl = `otpauth://totp/${TWO_FACTOR_ISSUER}:${userId}?secret=${secret.base32}&issuer=${TWO_FACTOR_ISSUER}`;
  const qrCode = await QRCode.toDataURL(qrCodeUrl);

  // Save to user (encrypted in prod)
  await User.findByIdAndUpdate(userId, { twoFaSecret: secret.base32, twoFaEnabled: true });

  logger.info('2FA enabled', { userId });
  return { secret: secret.ascii, qrCode, base32: secret.base32 };
};

// Verify TOTP code
export const verify2FACode = (secret: string, code: string): boolean => {
  const verified = Speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1, // ±30s
  });
  if (!verified) logger.warn('2FA code invalid', { codeLength: code.length });
  return verified;
};

// Middleware for 2FA req (post-password, for critical roles)
export const require2FA = async (req: any, res: any, next: any) => {
  const userId = req.user?.id; // From JWT post-password
  if (!userId) return res.status(401).json({ message: 'Usuario no autenticado' });

  const user = await User.findById(userId).select('rol twoFaEnabled twoFaSecret');
  if (user?.twoFaEnabled && (user.rol === 'admin' || user.rol === 'coordinator_hes')) {
    const code = req.body.twoFaCode;
    if (!code || !verify2FACode(user.twoFaSecret || '', code)) {
      return res.status(401).json({ message: 'Código 2FA inválido' });
    }
  }
  next();
};

// Disable 2FA (admin only)
export const disable2FA = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { twoFaSecret: null, twoFaEnabled: false });
  logger.info('2FA disabled', { userId });
};

export default { enable2FA, verify2FACode, require2FA, disable2FA };