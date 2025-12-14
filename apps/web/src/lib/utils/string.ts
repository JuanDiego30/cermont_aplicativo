/**
 * @util String Utilities
 * @description Utilidades para manejo de strings en el frontend
 * 
 * Principio DRY: Centraliza formateo y validación de strings
 */

/**
 * Genera slug a partir de texto
 */
export function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo alfanuméricos
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Múltiples guiones a uno
}

/**
 * Capitaliza primera letra
 */
export function capitalizar(texto: string): string {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra
 */
export function capitalizarPalabras(texto: string): string {
  return texto
    .split(' ')
    .map(word => capitalizar(word))
    .join(' ');
}

/**
 * Trunca texto con elipsis
 */
export function truncar(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto;
  return texto.slice(0, maxLength - 3) + '...';
}

/**
 * Extrae iniciales de un nombre
 */
export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formatea número de orden con padding
 */
export function formatearNumeroOrden(numero: number, prefijo = 'ORD'): string {
  return `${prefijo}-${numero.toString().padStart(6, '0')}`;
}

/**
 * Valida formato de email
 */
export function esEmailValido(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida cédula colombiana (básico)
 */
export function esCedulaValida(cedula: string): boolean {
  const soloNumeros = cedula.replace(/\D/g, '');
  return soloNumeros.length >= 6 && soloNumeros.length <= 10;
}

/**
 * Formatea cédula con separadores
 */
export function formatearCedula(cedula: string): string {
  const soloNumeros = cedula.replace(/\D/g, '');
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formatea número de teléfono colombiano
 */
export function formatearTelefono(telefono: string): string {
  const soloNumeros = telefono.replace(/\D/g, '');
  if (soloNumeros.length === 10) {
    return `${soloNumeros.slice(0, 3)} ${soloNumeros.slice(3, 6)} ${soloNumeros.slice(6)}`;
  }
  return soloNumeros;
}

/**
 * Pluraliza una palabra en español (básico)
 */
export function pluralizar(singular: string, cantidad: number): string {
  if (cantidad === 1) return singular;
  
  // Reglas básicas del español
  if (singular.endsWith('z')) {
    return singular.slice(0, -1) + 'ces';
  }
  if (singular.endsWith('s') || singular.endsWith('x')) {
    return singular;
  }
  if (/[aeiou]$/i.test(singular)) {
    return singular + 's';
  }
  return singular + 'es';
}

/**
 * Genera texto descriptivo con cantidad
 */
export function cantidadConTexto(cantidad: number, singular: string): string {
  return `${cantidad} ${pluralizar(singular, cantidad)}`;
}
