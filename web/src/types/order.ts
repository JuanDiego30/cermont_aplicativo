/**
 * Estados de una orden de servicio
 * Sincronizado con el backend (api/src/modules/ordenes/ordenes.types.ts)
 */
export type OrderStatus = 
  | 'planeacion'
  | 'ejecucion'
  | 'pausada'
  | 'completada'
  | 'cancelada';

/**
 * Niveles de prioridad de una orden
 */
export type OrderPriority = 'baja' | 'media' | 'alta' | 'urgente';

/**
 * Tipos de orden de servicio
 */
export type OrderType = 'instalacion' | 'mantenimiento' | 'reparacion' | 'inspeccion';

/**
 * Representa una orden de servicio completa
 */
export interface Order {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: OrderStatus;
  prioridad: OrderPriority;
  tipo?: OrderType;
  ubicacion?: string;
  fechaFinEstimada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  
  // Relaciones
  creadorId?: string;
  creador?: {
    id: string;
    name: string;
    email: string;
  };
  asignadoId?: string;
  asignado?: {
    id: string;
    name: string;
    email: string;
  };
  items?: OrderItem[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Item dentro de una orden
 */
export interface OrderItem {
  id: string;
  descripcion: string;
  cantidad: number;
  completado: boolean;
  notas?: string;
}

/**
 * Datos para crear una nueva orden
 */
export interface CreateOrderInput {
  numero?: string;
  descripcion?: string;
  cliente: string;
  tipo?: OrderType;
  prioridad?: OrderPriority;
  ubicacion?: string;
  fechaFinEstimada?: string;
}

/**
 * Datos para actualizar una orden existente
 */
export interface UpdateOrderInput {
  numero?: string;
  descripcion?: string;
  cliente?: string;
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  tipo?: OrderType;
  ubicacion?: string;
  fechaFinEstimada?: string;
}

/**
 * Filtros para buscar órdenes
 */
export interface OrderFilters {
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  cliente?: string;
  search?: string;
  page?: number;
  limit?: number;
}
