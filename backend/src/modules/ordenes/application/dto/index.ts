export * from "./create-orden.dto";
export * from "./update-orden.dto";
export * from "./change-estado-orden.dto";
export * from "./asignar-tecnico-orden.dto";
export * from "./query-ordenes.dto";
export * from "./orden-response.dto";

// Exportar DTOs de class-validator desde orden.dto.ts
export {
  // Enums
  PrioridadOrden,
  EstadoOrden,
  EstadoTransicion,
  // DTOs
  CreateOrdenDto,
  UpdateOrdenDto,
  ChangeEstadoDto,
  TransitionStateDto,
  OrdenQueryDto,
  // Response types
  type OrdenResponse,
  type OrdenListResponse,
  type OrdenDetailResponse,
  type OrdenItemDTO,
  type EvidenciaDTO,
  type CostoDTO,
  type PlaneacionDTO,
  type EjecucionDTO,
} from "./orden.dto";

// Aliases para compatibilidad temporal (deprecar en futuro)
export type {
  OrdenResponse as OrdenResponseZod,
  OrdenListResponse as OrdenListResponseZod,
  OrdenDetailResponse as OrdenDetailResponseZod,
} from "./orden.dto";
