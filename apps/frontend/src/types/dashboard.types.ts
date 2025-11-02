// Tipos para el dashboard y KPIs
export interface DashboardKPIs {
  open: number;
  inProgress: number;
  closed: number;
  last7: number;
}

export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string[];
}

export interface DashboardStats extends DashboardKPIs {
  totalOrders: number;
  completionRate: number;
  averageTime: number;
}
