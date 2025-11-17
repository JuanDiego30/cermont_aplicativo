import type { OrderPriority, OrderState } from '../types/order';

/**
 * Shared Types for API Client
 * Central location for all API-related type definitions
 */

// Generic API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// Order Types

export interface Order {
  id: string;
  codigo: string;
  cliente: string;
  descripcion?: string;
  ubicacion?: string;
  state: OrderState | string;
  prioridad?: string;
  responsableId?: string;
  notas?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface CreateOrderRequest {
  cliente: string;
  descripcion: string;
  ubicacion: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  fechaInicioEstimada?: string;
  notas?: string;
}

export interface UpdateOrderRequest {
  state?: OrderState;
  descripcion?: string;
  responsableId?: string;
}

export interface TransitionStateRequest {
  newState: OrderState;
  notes?: string;
}

export interface AssignOrderRequest {
  responsableId: string;
}

export interface OrderFilters {
  state?: OrderState;
  cliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  responsableId?: string;
}

export interface OrderStats {
  total: number;
  byState: Record<OrderState, number>;
  byPriority: Record<OrderPriority, number>;
}

// WorkPlan Types
export interface WorkPlan {
  id: string;
  orderId: string;
  title: string;
  description: string;
  budget: number;
  estimatedHours: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkPlanRequest {
  orderId: string;
  title: string;
  description: string;
  budget: number;
  estimatedHours: number;
}

export interface ApproveWorkPlanRequest {
  approvedBudget?: number;
  notes?: string;
}

export interface RejectWorkPlanRequest {
  reason: string;
}

export interface UpdateBudgetRequest {
  budget: number;
  reason: string;
}

// Evidence Types
export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Evidence {
  id: string;
  orderId: string;
  stage: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  status: EvidenceStatus;
  version: number;
  previousVersions: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UploadEvidenceRequest {
  orderId: string;
  stage: string;
  type: string;
  file: File;
  metadata?: Record<string, unknown>;
}

export interface ApproveEvidenceRequest {
  notes?: string;
}

export interface RejectEvidenceRequest {
  reason: string;
}

export type EvidenceStage = 'VISITA' | 'EJECUCION' | 'INFORME';

// Kit Types
export interface Kit {
  id: string;
  name: string;
  description: string;
  items: KitItem[];
  createdAt: string;
  updatedAt: string;
}

export interface KitItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface CreateKitRequest {
  name: string;
  description: string;
  items: Omit<KitItem, 'id'>[];
}

// Report Types
export interface GenerateReportResponse {
  reportId: string;
  fileName: string;
  fileUrl: string;
  generatedAt: string;
}

// Dashboard Types
export interface DashboardKPIs {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  ordersByState: Record<OrderState, number>;
  recentActivity: DashboardActivity[];
  performanceMetrics: PerformanceMetrics;
}

export interface DashboardActivity {
  id: string;
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'EVIDENCE_UPLOADED' | 'WORKPLAN_SUBMITTED';
  description: string;
  timestamp: string;
  orderId?: string;
}

export interface PerformanceMetrics {
  averageCompletionTime: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
}