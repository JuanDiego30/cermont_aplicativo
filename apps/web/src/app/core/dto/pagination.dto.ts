/**
 * @file Pagination DTO - DTOs estandarizados de paginación
 * @description DTOs compatibles con backend para queries de paginación
 */

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
