import { randomBytes } from 'node:crypto';

/**
 * Genera un ID seguro de longitud fija usando `crypto.randomBytes`.
 */
export function generateUniqueId(length = 32): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('La longitud debe ser un número entero positivo');
  }

  const bytesNeeded = Math.ceil(length / 2);
  return randomBytes(bytesNeeded).toString('hex').slice(0, length);
}
