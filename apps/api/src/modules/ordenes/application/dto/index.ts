export * from "./create-orden.dto";
export * from "./update-orden.dto";
export * from "./change-estado-orden.dto";
export * from "./asignar-tecnico-orden.dto";
export * from "./query-ordenes.dto";
export * from "./orden-response.dto";
export * from "./shared-types";

// Mantener compatibilidad con código existente que usa Zod (migrar gradualmente)
// Exportar solo los tipos/interfaces que no entran en conflicto
export {
  CreateOrdenSchema,
  UpdateOrdenSchema,
  ChangeEstadoSchema,
  TransitionStateSchema,
  OrdenQuerySchema,
  type ChangeEstadoDto,
  type TransitionStateDto,
  type OrdenQueryDto,
} from "./orden.dto";
// Re-exportar tipos con nombres únicos para evitar conflictos
export type {
  OrdenResponse as OrdenResponseZod,
  OrdenListResponse as OrdenListResponseZod,
  OrdenDetailResponse as OrdenDetailResponseZod,
} from "./orden.dto";
