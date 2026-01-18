/**
 * Orders DTOs - Shared between Backend and Frontend
 */
import { OrderPriority, OrderStatus, OrderType } from '../enums';

// ============ Base Interfaces ============

export interface OrderTechnicianInfo {
  id: string;
  nombre: string;
  especialidad?: string;
}

export interface OrderCustomerInfo {
  id: string;
  razonSocial: string;
  nit?: string;
}

export interface OrderLocationInfo {
  nombre: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
}

// ============ Create DTOs ============

export interface CreateOrderDto {
  descripcion: string;
  clienteId: string;
  tipoOrden?: OrderType;
  prioridad?: OrderPriority;
  fechaProgramada?: string;
  ubicacion?: OrderLocationInfo;
  observaciones?: string;
  tecnicoAsignadoId?: string;
}

// ============ Update DTOs ============

export interface UpdateOrderDto {
  descripcion?: string;
  tipoOrden?: OrderType;
  prioridad?: OrderPriority;
  fechaProgramada?: string;
  ubicacion?: OrderLocationInfo;
  observaciones?: string;
  tecnicoAsignadoId?: string;
}

export interface ChangeOrderStatusDto {
  nuevoEstado: OrderStatus;
  motivo: string;
  usuarioId?: string;
  observaciones?: string;
}

// ============ Query DTOs ============

export interface OrdersQueryDto {
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  tipoOrden?: OrderType;
  clienteId?: string;
  tecnicoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// ============ Response DTOs ============

export interface OrderResponseDto {
  id: string;
  numero: string;
  descripcion: string;
  estado: OrderStatus;
  prioridad: OrderPriority;
  tipoOrden?: OrderType;
  cliente: OrderCustomerInfo;
  tecnicoAsignado?: OrderTechnicianInfo;
  ubicacion?: OrderLocationInfo;
  fechaCreacion: string;
  fechaProgramada?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  observaciones?: string;
}

export interface OrderDetailResponseDto extends OrderResponseDto {
  historialEstados: OrderStatusHistoryItem[];
  evidencias: OrderEvidenceItem[];
  costos: OrderCostItem[];
}

export interface OrderStatusHistoryItem {
  id: string;
  estadoAnterior: OrderStatus;
  estadoNuevo: OrderStatus;
  fecha: string;
  motivo?: string;
  usuario?: string;
}

export interface OrderEvidenceItem {
  id: string;
  tipo: string;
  descripcion?: string;
  url: string;
  fechaSubida: string;
}

export interface OrderCostItem {
  id: string;
  concepto: string;
  monto: number;
  moneda: string;
  fecha: string;
}

export interface PaginatedOrders {
  data: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ Dashboard DTOs ============

export interface OrdersSummaryDto {
  total: number;
  porEstado: Record<OrderStatus, number>;
  porPrioridad: Record<OrderPriority, number>;
  completadasHoy: number;
  pendientesUrgentes: number;
}
