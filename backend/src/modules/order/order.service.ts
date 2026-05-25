/**
 * Order Service — Barrel Re-export
 *
 * Re-exports all order service functions for backward compatibility.
 * Split into:
 * - order-crud.service.ts: CRUD operations
 * - order-state.service.ts: State transitions and lifecycle
 */

// Re-export all order service functions
export * from "./order-crud.service";
export * from "./order-state.service";
