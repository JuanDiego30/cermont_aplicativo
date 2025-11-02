// Tipos comunes para la aplicación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}
