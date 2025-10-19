/**
 * Tipos comunes utilizados en toda la aplicación
 */

/**
 * Tipo genérico para respuestas de API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Tipo para errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Tipo para paginación
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Tipo para opciones de select/dropdown
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Tipo para metadatos de archivos
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

/**
 * Estados de carga comunes
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Tipo para coordenadas geográficas
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}
