/**
 * Order Types
 */

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
  URGENT = 'URGENT',
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  description: string;
  location: string;
  state: OrderState | string;
  priority?: OrderPriority | string;
  estimatedHours?: number;
  archived: boolean;
  responsibleId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDTO {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  description: string;
  location: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours?: number;
}

export interface UpdateOrderDTO {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  description?: string;
  location?: string;
  priority?: string;
  estimatedHours?: number;
  state?: OrderState;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  state?: OrderState;
  priority?: OrderPriority;
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
