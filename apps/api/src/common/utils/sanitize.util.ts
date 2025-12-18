/**
 * @file sanitize.util.ts
 * @description Utilidades de sanitización para proteger contra SQL injection y XSS
 * 
 * Uso: Sanitizar input de usuario antes de usar en queries o mostrar en UI
 */

/**
 * Sanitiza un término de búsqueda para uso seguro en BD
 * Remueve caracteres especiales peligrosos para SQL
 * 
 * @param input - String del usuario
 * @param maxLength - Longitud máxima permitida (default: 100)
 * @returns String sanitizado seguro para búsquedas
 * 
 * @example
 * const safe = sanitizeSearchTerm("'; DROP TABLE users;--");
 * // Retorna: " DROP TABLE users"
 */
export function sanitizeSearchTerm(input: string, maxLength: number = 100): string {
    if (!input || typeof input !== 'string') return '';

    // Limitar longitud
    let sanitized = input.substring(0, maxLength);

    // Remover caracteres especiales SQL
    sanitized = sanitized
        .replace(/[%;_]/g, '')    // Wildcards SQL
        .replace(/['"`]/g, '')    // Quotes
        .replace(/[;-]{2,}/g, '')    // SQL injection patterns (consecutive dashes)
        .replace(/[\x00-\x1F]/g, '') // Control characters
        .trim();

    return sanitized;
}

/**
 * Sanitiza input JSON recursivamente
 * Limita profundidad, longitud de strings, y tamaño de arrays
 * 
 * @param obj - Objeto a sanitizar
 * @param maxDepth - Profundidad máxima de recursión (default: 5)
 * @returns Objeto sanitizado
 */
export function sanitizeJsonInput(obj: unknown, maxDepth: number = 5): unknown {
    if (maxDepth <= 0) return null;

    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        if (typeof obj === 'string') {
            return obj.substring(0, 1000); // Limitar strings a 1000 chars
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj
            .slice(0, 100) // Máximo 100 items
            .map((item) => sanitizeJsonInput(item, maxDepth - 1));
    }

    const sanitized: Record<string, unknown> = {};
    const entries = Object.entries(obj as Record<string, unknown>);

    for (const [key, value] of entries.slice(0, 50)) { // Máximo 50 keys
        if (key.length > 100) continue; // Keys muy largos = sospechoso
        sanitized[key] = sanitizeJsonInput(value, maxDepth - 1);
    }

    return sanitized;
}

/**
 * Valida que un string sea alfanumérico seguro para búsquedas
 * Solo permite letras, números, espacios, guiones, underscores y puntos
 * 
 * @param input - String a validar
 * @returns true si es seguro, false si contiene caracteres peligrosos
 */
export function isAlphanumericSearch(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return /^[a-zA-Z0-9\s\-_\.áéíóúÁÉÍÓÚñÑ]*$/.test(input);
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * 
 * @param input - String potencialmente peligroso
 * @returns String con caracteres HTML escapados
 */
export function escapeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';

    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Sanitiza un nombre de archivo para evitar path traversal
 * 
 * @param filename - Nombre de archivo del usuario
 * @returns Nombre de archivo seguro
 */
export function sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') return 'unnamed';

    return filename
        .replace(/\.\.[\/\\]/g, '')     // Path traversal
        .replace(/[<>:"|?*]/g, '')      // Caracteres ilegales en Windows
        .replace(/[\x00-\x1F]/g, '')    // Control characters
        .substring(0, 255)              // Límite de longitud
        .trim() || 'unnamed';
}
