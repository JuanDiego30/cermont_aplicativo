/**
 * Password Policy Middleware (TypeScript - November 2025)
 * @description Validación estricta de contraseñas: 12+ chars, upper/lower/digit/special. Reusable en register/login/reset. Secure: Regex no PII, feedback clear.
 * Uso: En auth.routes: body('password').custom(passwordValidator)(), then hash with argon2.
 * Integrado con: express-validator@7.2.0, argon2@0.41.0. Policies: Min 12, 1 upper, 1 lower, 1 digit, 1 special (!@#$%^&*). No common words (future zxcvbn).
 * Performance: Sync regex, low overhead. Extensible: Add entropy check (zxcvbn lib). Tests: Jest validate pass/fail cases.
 * Fixes: 12+ chars (vs 8), complexity regex, custom error msgs en español. tsconfig strict.
 * Assumes: User register flow. Deps: express-validator.
 */

import { body, ValidationChain } from 'express-validator';
import argon2 from 'argon2';
import { logger } from '../utils/logger.js';

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;

export const passwordValidator = (): ValidationChain => body('password')
  .isLength({ min: PASSWORD_MIN_LENGTH })
  .matches(PASSWORD_REGEX)
  .withMessage((value: string) => {
    let msg = `Contraseña inválida. Mínimo ${PASSWORD_MIN_LENGTH} caracteres, con mayúscula, minúscula, número y especial (!@#$%^&*).`;
    if (!value || value.length < PASSWORD_MIN_LENGTH) msg += ` Actual: ${value?.length || 0} chars.`;
    if (!PASSWORD_REGEX.test(value || '')) msg += ' Falta complejidad.';
    logger.warn('Password policy fail', { length: value?.length, hasComplexity: PASSWORD_REGEX.test(value || '') });
    return msg;
  });

// Usage en routes
// router.post('/register', [passwordValidator(), /* other validators */], async (req, res) => { /* hash & save */ });

// Hash integration (in auth.service)
import { hash } from 'argon2';
export const hashPassword = async (password: string): Promise<string> => {
  if (!PASSWORD_REGEX.test(password)) throw new Error('Política de contraseña no cumplida');
  return hash(password, { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 4 });
};