/**
 * @file orden.utils.ts
 * @description Utility functions for Orders module
 */

/**
 * Formats a date string to local Colombian date string
 */
export function formatOrderDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

/**
 * Transforms an OrderStatus key to a readable label
 */
export function formatOrderStatus(status: string): string {
    return status.replace(/_/g, ' ');
}

/**
 * Transforms an OrderType key to a readable label
 */
export function formatOrderType(type?: string): string {
    return type ? type.replace(/_/g, ' ') : '-';
}
