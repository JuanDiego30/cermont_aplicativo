/**
 * @module Common Utilities
 * @description Exportación centralizada de utilidades compartidas
 *
 * Uso:
 *   import { calcularTotalConIVA, diasDesde, generarNumeroOrden } from '../shared/utils';
 */

// Utilidades de paginación
export * from './pagination.util';

// Utilidades financieras (Colombia)
export * from './financial-colombia.util';

// Utilidades de fechas
export * from './date.util';

// Utilidades de strings
export * from './string.util';

// Utilidades de sanitización
export * from './sanitize.util';

// Decimal.js wrapper
export * from './decimal.util';

// Null/undefined helpers
export * from './null-undefined.util';
