/**
 * Utilidades de validación de datos
 */

/**
 * Valida si un string es un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si un string es un número de teléfono colombiano válido
 */
export function isValidPhoneCO(phone: string): boolean {
  // Acepta: 3001234567, +573001234567, 573001234567
  const phoneRegex = /^(\+?57)?[3][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida si un string es una URL válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida longitud de contraseña
 */
export function isValidPassword(password: string, minLength = 8): boolean {
  return password.length >= minLength;
}

/**
 * Sanitiza input de usuario removiendo caracteres peligrosos
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remover < >
    .trim();
}
