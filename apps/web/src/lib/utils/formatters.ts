/**
 * @file formatters.ts
 * @description Shared formatting utilities
 * Eliminates duplicate formatting code across modules
 */

/**
 * Format currency in Colombian Pesos
 */
export function formatMonto(monto: number | undefined | null): string {
    if (monto === undefined || monto === null) return '$0';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(monto);
}

/**
 * Format date in Colombian format
 */
export function formatFecha(
    fecha: Date | string | undefined | null,
    options?: Intl.DateTimeFormatOptions,
): string {
    if (!fecha) return '-';

    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options,
    }).format(date);
}

/**
 * Format date and time
 */
export function formatFechaHora(fecha: Date | string | undefined | null): string {
    return formatFecha(fecha, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format relative time (e.g., "hace 2 horas")
 */
export function formatRelativeTime(fecha: Date | string | undefined | null): string {
    if (!fecha) return '-';

    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;

    return formatFecha(date);
}

/**
 * Estado display with emoji
 */
export const ESTADO_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    pendiente: { label: 'Pendiente', emoji: '⏳', color: 'yellow' },
    planeacion: { label: 'Planeación', emoji: '📋', color: 'blue' },
    en_progreso: { label: 'En Progreso', emoji: '🔄', color: 'blue' },
    ejecucion: { label: 'Ejecución', emoji: '🔧', color: 'orange' },
    pausada: { label: 'Pausada', emoji: '⏸️', color: 'gray' },
    completada: { label: 'Completada', emoji: '✅', color: 'green' },
    cancelada: { label: 'Cancelada', emoji: '❌', color: 'red' },
};

export function formatEstado(estado: string | undefined | null): string {
    if (!estado) return '-';
    const config = ESTADO_LABELS[estado.toLowerCase()];
    return config ? `${config.emoji} ${config.label}` : estado;
}

export function getEstadoColor(estado: string | undefined | null): string {
    if (!estado) return 'gray';
    return ESTADO_LABELS[estado.toLowerCase()]?.color || 'gray';
}

/**
 * Prioridad display
 */
export const PRIORIDAD_LABELS: Record<string, { label: string; color: string }> = {
    baja: { label: 'Baja', color: 'gray' },
    media: { label: 'Media', color: 'yellow' },
    alta: { label: 'Alta', color: 'orange' },
    urgente: { label: 'Urgente', color: 'red' },
    critica: { label: 'Crítica', color: 'red' },
};

export function formatPrioridad(prioridad: string | undefined | null): string {
    if (!prioridad) return '-';
    const config = PRIORIDAD_LABELS[prioridad.toLowerCase()];
    return config?.label || prioridad;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string | undefined | null, maxLength: number = 50): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

/**
 * Format phone number
 */
export function formatTelefono(telefono: string | undefined | null): string {
    if (!telefono) return '-';

    // Remove non-digits
    const digits = telefono.replace(/\D/g, '');

    // Colombian format: 3XX XXX XXXX
    if (digits.length === 10) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }

    return telefono;
}

/**
 * Format percentage
 */
export function formatPorcentaje(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0%';
    return `${Math.round(value)}%`;
}
