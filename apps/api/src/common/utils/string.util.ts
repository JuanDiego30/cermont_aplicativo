/**
 * ARCHIVO: string.util.ts
 * FUNCION: Utilidades centralizadas para manejo y validación de strings
 * IMPLEMENTACION: Funciones puras para formateo, normalización y validación de texto
 * DEPENDENCIAS: Ninguna (vanilla TypeScript)
 * EXPORTS: generarNumeroOrden, capitalizar, slugify, esEmailValido, etc.
 */
/**
 * Genera un número de orden secuencial con formato
 * Ej: ORD-000001
 */
export function generarNumeroOrden(sequence: number, prefijo = 'ORD'): string {
  return `${prefijo}-${String(sequence).padStart(6, '0')}`;
}

/**
 * Genera un código aleatorio
 */
export function generarCodigo(longitud = 8): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

/**
 * Capitaliza la primera letra
 */
export function capitalizar(texto: string): string {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Convierte a Title Case
 */
export function toTitleCase(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map((palabra) => capitalizar(palabra))
    .join(' ');
}

/**
 * Limpia y normaliza texto para búsqueda
 */
export function normalizarParaBusqueda(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .trim();
}

/**
 * Trunca texto con ellipsis
 */
export function truncar(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto;
  return texto.slice(0, maxLength - 3) + '...';
}

/**
 * Slugifica un texto (para URLs)
 */
export function slugify(texto: string): string {
  return normalizarParaBusqueda(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parsea tags separados por coma
 */
export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Valida formato de email
 */
export function esEmailValido(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida formato de teléfono colombiano
 */
export function esTelefonoColombianoValido(telefono: string): boolean {
  // Formatos: 3001234567, +573001234567, 573001234567
  const regex = /^(\+57|57)?3[0-9]{9}$/;
  return regex.test(telefono.replace(/\s/g, ''));
}
