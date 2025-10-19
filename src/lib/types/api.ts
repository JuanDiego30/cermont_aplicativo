/**
 * Tipos relacionados con la API
 */

import type { ApiResponse } from './common';

/**
 * Endpoints de la API
 */
export enum ApiEndpoint {
  LOGIN = '/api/auth/login',
  REGISTER = '/api/auth/register',
  LOGOUT = '/api/auth/logout',
  WORK_ORDERS = '/api/work-orders',
  CCTV = '/api/work-orders/cctv',
  USERS = '/api/users',
}

/**
 * Métodos HTTP
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Configuración para llamadas a la API
 */
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  cache?: RequestCache;
}

/**
 * Tipo para usuario autenticado
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'technician';
  createdAt: string;
  updatedAt: string;
}

/**
 * Tipo para orden de trabajo CCTV
 */
export interface CctvWorkOrder {
  id: string;
  orderNumber: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  data: unknown; // Datos del formulario CCTV
}

/**
 * Respuestas tipadas de la API
 */
export type LoginResponse = ApiResponse<{ user: User; token: string }>;
export type WorkOrderResponse = ApiResponse<CctvWorkOrder>;
export type WorkOrderListResponse = ApiResponse<CctvWorkOrder[]>;
