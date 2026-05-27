// Single Source of Truth — Zod schemas for Cermont
// All business schemas are exported from ./schemas

// Re-export zod for convenience (optional, for schema extension)
export { z } from "zod";

// API response types and contracts
export * from "./api";
export * from "./constants";
export * from "./schemas";
// Utility types for advanced TypeScript patterns
export * from "./utils/types";
// Workflow helpers (cierre administrativo, ingestión documental)
export * from "./workflow";
