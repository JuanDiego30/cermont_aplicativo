/**
 * Billing Types
 * Tipos para facturación y estados de órdenes
 */

export interface BillingStats {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface BillingOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  totalAmount: number;
  billingState: BillingState;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type BillingState = 
  | 'PENDING' 
  | 'INVOICED' 
  | 'PAID' 
  | 'CANCELLED' 
  | 'REFUNDED';

export interface UpdateBillingStatePayload {
  orderId: string;
  newState: BillingState;
  notes?: string;
}

export interface BillingFilters {
  state?: BillingState;
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  search?: string;
}

export interface BillingListResponse {
  data: BillingOrder[];
  total: number;
  page: number;
  pageSize: number;
}
