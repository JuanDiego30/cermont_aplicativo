// Single Source of Truth — Zod schemas, RBAC, and config for Cermont
// All business schemas, roles, permissions, and environment validation are exported here

// Re-export zod for convenience (optional, for schema extension)
export { z } from "zod";
// API response types and contracts
export * from "./api";
// Environment configuration and validation
export * from "./config";
// Chart color constants
export * from "./constants";
// Error serialization utilities
export * from "./errors";

// RBAC - Roles, Permissions, and Access Control
export * from "./rbac";
export * from "./schemas";

// Utility types for advanced TypeScript patterns
export * from "./utils";
