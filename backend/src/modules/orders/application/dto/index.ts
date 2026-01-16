export * from './asignar-tecnico-order.dto';
export * from './change-estado-order.dto';
export * from './create-order.dto';
export * from './order-response.dto';
export * from './query-orders.dto';
export * from './update-order.dto';

// Exportar DTOs de class-validator desde Order.dto.ts
export {
  ChangeEstadoDto,
  // DTOs
  CreateOrderDto,
  EstadoOrder,
  EstadoTransicion,
  OrderQueryDto,
  // Enums
  PrioridadOrder,
  TransitionStateDto,
  UpdateOrderDto,
  type CostoDTO,
  type EjecucionDTO,
  type EvidenciaDTO,
  type OrderDetailResponse,
  type OrderItemDTO,
  type OrderListResponse,
  // Response types
  type OrderResponse,
  type PlaneacionDTO,
} from './order.dto';

// Aliases para compatibilidad temporal (deprecar en futuro)
export type {
  OrderDetailResponse as OrderDetailResponseZod,
  OrderListResponse as OrderListResponseZod,
  OrderResponse as OrderResponseZod,
} from './order.dto';
