/**
 * Password Hashing Utilities (Argon2)
 * @description Utilidades modernas para hash de contraseñas con Argon2
 */

import argon2 from 'argon2';

/**
 * Hash password con Argon2
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Hash de la contraseña
 */
export const hashPassword = async (password) => {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Mejor balance CPU/memoria
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // 3 iteraciones
    parallelism: 1, // Single thread
  });
};

/**
 * Verificar password contra hash
 * @param {string} hash - Hash almacenado
 * @param {string} password - Contraseña a verificar
 * @returns {Promise<boolean>} True si coincide
 */
export const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};

/**
 * Detectar tipo de hash (bcrypt vs argon2)
 * @param {string} hash - Hash a analizar
 * @returns {string} 'bcrypt' o 'argon2'
 */
export const detectHashType = (hash) => {
  if (!hash || typeof hash !== 'string') return 'unknown';
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    return 'bcrypt';
  }
  if (hash.startsWith('$argon2') || hash.startsWith('$argon2i') || hash.startsWith('$argon2id')) {
    return 'argon2';
  }
  return 'unknown';
};
