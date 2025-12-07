/**
 * Tipos compartidos entre Frontend y Backend
 * Estos tipos deben mantenerse sincronizados
 */

// ============================================
// ENUMS
// ============================================

export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'administrativo';

export type OrderStatus = 'planeacion' | 'ejecucion' | 'pausada' | 'completada' | 'cancelada';

export type OrderPriority = 'baja' | 'media' | 'alta' | 'urgente';

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserResponse;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: OrderStatus;
  prioridad: OrderPriority;
  fechaFinEstimada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  creadorId?: string;
  asignadoId?: string;
  creador?: UserResponse;
  asignado?: UserResponse;
  items?: OrderItem[];
  evidencias?: Evidence[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  descripcion: string;
  cantidad: number;
  completado: boolean;
  notas?: string;
}

export interface Evidence {
  id: string;
  tipo: string;
  url: string;
  descripcion?: string;
  createdAt: string;
}

export interface CreateOrderInput {
  descripcion: string;
  cliente: string;
  prioridad?: OrderPriority;
  fechaFinEstimada?: string;
  asignadoId?: string;
  items?: Omit<OrderItem, 'id'>[];
}

export interface UpdateOrderInput {
  descripcion?: string;
  cliente?: string;
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  fechaFinEstimada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  asignadoId?: string;
}

export interface OrderFilters {
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  cliente?: string;
  asignadoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}
