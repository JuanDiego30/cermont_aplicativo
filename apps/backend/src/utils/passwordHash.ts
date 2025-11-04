/**
 * Password Hashing Utilities (TypeScript - November 2025)
 * FIXED: Removed problematic regex from JSDoc that was causing parse errors
 */

import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import { AppError } from './errorHandler';
import { logUserAction } from './logger';
import { PASSWORD_MIN_LENGTH, HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from './constants';
import type { Request } from 'express';

export type HashType = 'argon2' | 'bcrypt' | 'unknown';

/**
 * Configuración de Argon2 (tunable via env)
 */
const getArgon2Options = (): Record<string, any> => ({
  type: argon2.argon2id,
  memoryCost: Number(process.env.ARGON2_MEMORY_COST) || 2 ** 16,
  timeCost: Number(process.env.ARGON2_TIME_COST) || 3,
  parallelism: Number(process.env.ARGON2_PARALLELISM) || 1,
  hashLength: 32,
});

/**
 * Valida fuerza de contraseña (min length + patrones)
 * @param password - Contraseña a validar
 * @returns true si válida, sino throw AppError
 */
export const validatePasswordStrength = (password: string): boolean => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(
      ERROR_MESSAGES.WEAK_PASSWORD,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'password', message: `Must be at least ${PASSWORD_MIN_LENGTH} characters` } }
    );
  }
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!pattern.test(password)) {
    throw new AppError(
      ERROR_MESSAGES.WEAK_PASSWORD,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'password', message: 'Must include upper, lower, number, and special char' } }
    );
  }
  return true;
};

/**
 * Hash password con Argon2 (principal)
 * @param password - Contraseña en texto plano (validated)
 * @returns Hash de la contraseña (Promise<string>)
 * @throws AppError si invalid input o hash fail
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    throw new AppError(
      ERROR_MESSAGES.VALIDATION_FAILED,
      HTTP_STATUS.BAD_REQUEST,
      { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'password', message: 'Password required' } }
    );
  }
  validatePasswordStrength(password);

  // FIXED: Return string type explicitly
  try {
    const hash: string = await argon2.hash(password, getArgon2Options());
    return hash;
  } catch (err) {
    // Log sin PII
    logUserAction('system', 'PASSWORD_HASH_FAIL', { error: (err as Error).message });
    throw new AppError(
      'Failed to hash password',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { code: ERROR_CODES.INTERNAL_ERROR }
    );
  }
};

/**
 * Verificar password contra hash (Argon2 o bcrypt detect auto)
 * @param hash - Hash almacenado
 * @param password - Contraseña a verificar
 * @returns Promise<boolean> true si coincide
 */
export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
  if (!hash || !password) return false;

  const hashType = detectHashType(hash);
  try {
    if (hashType === 'argon2') {
      return await argon2.verify(hash, password); // Constant-time
    } else if (hashType === 'bcrypt') {
      // Legacy bcrypt verify
      return await bcrypt.compare(password, hash);
    }
    // Unknown: Fail safe
    return false;
  } catch (err) {
    // Invalid hash/format: Fail (no leak)
    logUserAction('anonymous', 'PASSWORD_VERIFY_FAIL', { hashType, error: (err as Error).message });
    return false;
  }
};

/**
 * Detectar tipo de hash (bcrypt vs argon2)
 * @param hash - Hash string a analizar
 * @returns HashType ('argon2' | 'bcrypt' | 'unknown')
 */
export const detectHashType = (hash: string): HashType => {
  if (!hash || typeof hash !== 'string' || hash.length < 10) return 'unknown';
  if (/^\$argon2(id|i|d)/.test(hash)) return 'argon2';
  if (/^\$2[aby]\$/.test(hash)) return 'bcrypt';
  return 'unknown';
};

/**
 * Migrar hash bcrypt a Argon2 (on verify success, rehash)
 * @param user - User document (con password actual)
 * @param password - Plain password (verified)
 * @param req - Request para logging/context
 * @returns Promise<void> (updates user.password)
 */
export const migratePasswordHash = async (user: any, password: string, req?: Request): Promise<void> => {
  const currentType = detectHashType(user.password);
  if (currentType !== 'bcrypt') return; // Solo migrate bcrypt

  try {
    const newHash = await hashPassword(password);
    user.password = newHash;
    await user.save({ validateModifiedOnly: true });
    const userId = user._id.toString();
    logUserAction(userId, 'PASSWORD_MIGRATED', { from: 'bcrypt', to: 'argon2', ip: req?.ip });
  } catch (err) {
    logUserAction('system', 'PASSWORD_MIGRATION_FAIL', { userId: user._id.toString(), error: (err as Error).message });
    throw new AppError('Migration failed, try again', HTTP_STATUS.INTERNAL_SERVER_ERROR, { code: ERROR_CODES.INTERNAL_ERROR });
  }
};

/**
 * Generar password temporal (para reset, optional)
 * @param length - Longitud (default 12)
 * @returns Random string strong
 */
export const generateTempPassword = (length: number = 12): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  // Ensure strength
  return validatePasswordStrength(password) ? password : generateTempPassword(length);
};

export default { hashPassword, verifyPassword, detectHashType, validatePasswordStrength, migratePasswordHash, generateTempPassword };
