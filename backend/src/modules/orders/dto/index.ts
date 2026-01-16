/**
 * @deprecated This folder contains legacy DTOs with incompatible enum values.
 * All imports should be redirected to '../application/dto'.
 *
 * This index file is kept temporarily for backward compatibility only.
 * New code should import from: '@modules/orders/application/dto'
 *
 * Gradual migration in progress - deadline 2026-02-01
 */

// Compatibility re-exports from legacy folder (for backward compatibility only)
export * from './create-order.dto';
export * from './query-order.dto';
export * from './response-order.dto';
export * from './update-order.dto';
