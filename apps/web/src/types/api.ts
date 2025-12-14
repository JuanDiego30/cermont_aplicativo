/**
 * ARCHIVO: api.ts
 * FUNCION: Define tipos genéricos para respuestas de API REST
 * IMPLEMENTACION: Interfaces genéricas con soporte para paginación y errores
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: ApiResponse<T>, PaginatedResponse<T>, ApiError
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
