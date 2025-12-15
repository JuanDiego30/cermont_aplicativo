/**
 * @file params.ts
 * @description Utilidades centralizadas para conversión de filtros a parámetros URL
 * @module @/lib/utils/params
 * 
 * PROBLEMA RESUELTO:
 * Esta función estaba duplicada en 6+ archivos con implementaciones casi idénticas.
 * Ahora está centralizada aquí para cumplir con el principio DRY.
 * 
 * ARCHIVOS QUE DEBEN MIGRAR:
 * - features/mantenimientos/api/mantenimientos.api.ts
 * - features/formularios/api/formularios.api.ts
 * - features/evidencias/api/evidencias.api.ts
 * - features/kits/services/kits.service.ts
 * - features/clientes/services/clientes.service.ts
 * - features/costos/services/costos.service.ts
 */

/**
 * Convierte un objeto de filtros a un objeto de strings para usar como query params
 * Filtra valores undefined, null y strings vacíos
 * 
 * @param filters - Objeto con filtros opcionales
 * @returns Objeto Record<string, string> o undefined si no hay filtros válidos
 * 
 * @example
 * const params = filtersToParams({ page: 1, search: 'test', empty: '' });
 * // Resultado: { page: '1', search: 'test' }
 */
export function filtersToParams(
    filters?: object | null
): Record<string, string> | undefined {
    if (!filters) return undefined;

    const params: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params[key] = String(value);
        }
    });

    return Object.keys(params).length > 0 ? params : undefined;
}

/**
 * Construye un URLSearchParams a partir de un objeto de filtros
 * Útil cuando necesitas el string directamente
 * 
 * @param filters - Objeto con filtros opcionales
 * @returns URLSearchParams instance
 * 
 * @example
 * const queryString = buildQueryString({ page: 1, limit: 10 }).toString();
 * // Resultado: "page=1&limit=10"
 */
export function buildQueryString<T extends Record<string, unknown>>(
    filters?: T
): URLSearchParams {
    const searchParams = new URLSearchParams();
    
    if (!filters) return searchParams;

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                // Soportar arrays: ?tags=a&tags=b
                value.forEach(v => searchParams.append(key, String(v)));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    return searchParams;
}

/**
 * Construye la URL completa con query params
 * 
 * @param baseUrl - URL base sin query params
 * @param filters - Objeto con filtros opcionales
 * @returns URL completa con query string si hay filtros
 * 
 * @example
 * const url = buildUrlWithParams('/api/users', { page: 1, role: 'admin' });
 * // Resultado: "/api/users?page=1&role=admin"
 */
export function buildUrlWithParams<T extends Record<string, unknown>>(
    baseUrl: string,
    filters?: T
): string {
    const queryString = buildQueryString(filters).toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
