/**
 * @file error.ts
 * @description Utilidades centralizadas para manejo de errores
 * @module @/lib/utils/error
 * 
 * PROBLEMA RESUELTO:
 * La función getErrorMessage estaba duplicada inline en múltiples hooks.
 * Ahora está centralizada aquí.
 */

/**
 * Tipo para errores de API con mensaje opcional
 */
export interface ApiErrorLike {
    message?: string;
    statusCode?: number;
    error?: string;
}

/**
 * Extrae el mensaje de un error de forma segura
 * 
 * @param error - Error de cualquier tipo
 * @param defaultMessage - Mensaje por defecto si no se puede extraer
 * @returns Mensaje de error extraído o el mensaje por defecto
 * 
 * @example
 * try {
 *   await api.create(data);
 * } catch (error) {
 *   toast.error(getErrorMessage(error, 'Error al crear'));
 * }
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
    // Error nativo de JavaScript
    if (error instanceof Error) {
        return error.message;
    }

    // Objeto con propiedad message (típico de APIs)
    if (typeof error === 'object' && error !== null) {
        const errorObj = error as ApiErrorLike;
        
        if (errorObj.message) {
            return errorObj.message;
        }
        
        if (errorObj.error) {
            return errorObj.error;
        }
    }

    // String directo
    if (typeof error === 'string') {
        return error;
    }

    return defaultMessage;
}

/**
 * Extrae el código de estado HTTP de un error
 * 
 * @param error - Error de cualquier tipo
 * @returns Código de estado o undefined
 */
export function getErrorStatusCode(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null) {
        const errorObj = error as ApiErrorLike;
        return errorObj.statusCode;
    }
    return undefined;
}

/**
 * Verifica si un error es un error de red (sin conexión)
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('Failed to fetch') ||
            error.name === 'TypeError'
        );
    }
    return false;
}

/**
 * Verifica si un error es de autenticación (401)
 */
export function isAuthError(error: unknown): boolean {
    return getErrorStatusCode(error) === 401;
}

/**
 * Verifica si un error es de autorización (403)
 */
export function isForbiddenError(error: unknown): boolean {
    return getErrorStatusCode(error) === 403;
}

/**
 * Verifica si un error es de recurso no encontrado (404)
 */
export function isNotFoundError(error: unknown): boolean {
    return getErrorStatusCode(error) === 404;
}

/**
 * Verifica si un error es de validación (400)
 */
export function isValidationError(error: unknown): boolean {
    return getErrorStatusCode(error) === 400;
}
