/**
 * Security Utilities (TypeScript - November 2025)
 * @description Funciones de seguridad para sanitización, validación y protección de datos
 * Uso: import { sanitizeQueryForCache, maskEmail, sanitizeInput } from '../utils/security'
 */

import type { ParsedQs } from 'qs';

/**
 * Sanitiza parámetros de query para uso en claves de caché
 * Convierte valores complejos a strings simples y elimina valores undefined
 * @param query - Objeto query de Express (req.query)
 * @returns Objeto sanitizado con valores string o string[]
 */
export function sanitizeQueryForCache(
  query: ParsedQs | Record<string, any>
): Record<string, string | string[]> {
  const sanitized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      // Convertir arrays a array de strings
      sanitized[key] = value
        .filter((v) => v !== undefined && v !== null)
        .map((v) => String(v));
    } else if (typeof value === 'object') {
      // Para objetos anidados, convertir a JSON string
      sanitized[key] = JSON.stringify(value);
    } else {
      // Valores primitivos a string
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

/**
 * Enmascara un email para logs (mantiene solo primeros 2 chars y dominio)
 * @param email - Email a enmascarar
 * @returns Email enmascarado (ej: us****@example.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***@***.***';
  }

  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 ? local.substring(0, 2) + '****' : '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * Sanitiza input básico (trim, elimina caracteres peligrosos)
 * @param input - String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Elimina < y > para prevenir XSS básico
    .substring(0, 1000); // Limita longitud
}

/**
 * Valida que un ObjectId de Mongoose sea válido (24 chars hexadecimales)
 * @param id - String a validar
 * @returns true si es ObjectId válido
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Genera un token aleatorio seguro para reseteo de contraseñas, etc.
 * @param length - Longitud del token en bytes (default 32)
 * @returns Token hexadecimal
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Valida formato de email básico
 * @param email - Email a validar
 * @returns true si formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza datos para logs de auditoría (elimina información sensible)
 * @param obj - Objeto a sanitizar
 * @returns Objeto sanitizado sin datos sensibles
 */
export function sanitizeLogData(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const clean = { ...obj };

  // Eliminar campos sensibles
  const sensitiveFields = ['password', 'refreshToken', 'accessToken', 'token', 'secret', 'key'];
  sensitiveFields.forEach(field => {
    if (clean[field]) {
      delete clean[field];
    }
  });

  // Para emails en logs de alta severidad, enmascarar
  if (clean.email && typeof clean.email === 'string') {
    clean.email = maskEmail(clean.email);
  }

  // Recursivamente sanitizar objetos anidados
  Object.keys(clean).forEach(key => {
    if (typeof clean[key] === 'object' && clean[key] !== null) {
      clean[key] = sanitizeLogData(clean[key]);
    }
  });

  return clean;
}
