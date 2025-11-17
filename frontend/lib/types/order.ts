export enum OrderState {
  SOLICITUD = 'SOLICITUD',
  VISITA = 'VISITA',
  PO = 'PO',
  PLANEACION = 'PLANEACION',
  EJECUCION = 'EJECUCION',
  INFORME = 'INFORME',
  ACTA = 'ACTA',
  SES = 'SES',
  FACTURA = 'FACTURA',
  PAGO = 'PAGO',
}

export enum OrderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Order {
  id: string;
  codigo: string;
  cliente: string;
  descripcion?: string;
  ubicacion?: string;
  state: OrderState | string; // Cambio de 'estado' a 'state' para consistencia
  prioridad?: string;
  responsableId?: string;
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface CreateOrderDTO {
  cliente: string;
  descripcion: string;
  ubicacion: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  fechaInicioEstimada?: string;
  notas?: string;
}

export interface UpdateOrderDTO {
  state?: OrderState;
  descripcion?: string;
  responsableId?: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  estado?: OrderState;
  prioridad?: OrderPriority;
  search?: string;
}

export interface ListOrdersResponse {
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
