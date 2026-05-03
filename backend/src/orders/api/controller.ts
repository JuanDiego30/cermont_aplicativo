/**
 * Order Controller — Barrel Re-export
 *
 * Re-exports all order controller handlers for backward compatibility.
 * Split into:
 * - order-crud.controller.ts: CRUD operations
 * - order-state.controller.ts: State transitions and lifecycle
 */

// Re-export all order controller handlers
export * from "./crud.controller";
export * from "./execution.controller";
export * from "./state.controller";
