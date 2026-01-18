/**
 * @dto ApiResponseDto
 *
 * DTOs estándar para respuestas de API - 100% type-safe sin 'any'
 * Garantiza consistencia en todas las respuestas.
 *
 * Refactorizado: Elimina 'any', usa tipos estrictos de ../types
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
  PaginationMeta,
  ValidationErrorItem,
} from '../types/api-response.types';
import { createPaginationMeta } from '../types/api-response.types';

/**
 * Respuesta exitosa genérica
 */
export class ApiSuccessResponseDto<T> implements SuccessResponse<T> {
  @ApiProperty({ example: true })
  readonly success: true = true;

  @ApiProperty()
  readonly data: T;

  @ApiPropertyOptional()
  readonly message?: string;

  @ApiPropertyOptional()
  readonly timestamp?: string;

  private constructor(data: T, message?: string) {
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Factory method para crear respuesta exitosa
   */
  static of<T>(data: T, message?: string): ApiSuccessResponseDto<T> {
    return new ApiSuccessResponseDto(data, message);
  }

  /**
   * Alias para compatibilidad
   */
  static create<T>(data: T, message?: string): ApiSuccessResponseDto<T> {
    return ApiSuccessResponseDto.of(data, message);
  }
}

/**
 * Respuesta de error estándar - type-safe
 */
export class ApiErrorResponseDto implements Omit<ErrorResponse, 'success'> {
  @ApiProperty({ example: false })
  readonly success: false = false;

  @ApiProperty({ example: 400 })
  readonly statusCode: number;

  @ApiProperty({ example: 'Error message' })
  readonly message: string;

  @ApiPropertyOptional({ example: 'Bad Request' })
  readonly error?: string;

  @ApiPropertyOptional({ example: 'VALIDATION_ERROR' })
  readonly code?: string;

  @ApiPropertyOptional({ type: 'array' })
  readonly errors?: readonly ValidationErrorItem[];

  @ApiProperty()
  readonly timestamp: string;

  @ApiProperty({ example: '/api/resource' })
  readonly path: string;

  private constructor(
    statusCode: number,
    message: string,
    path: string,
    options?: {
      error?: string;
      code?: string;
      errors?: ValidationErrorItem[];
    }
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.path = path;
    this.error = options?.error;
    this.code = options?.code;
    this.errors = options?.errors;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Factory method para crear respuesta de error
   */
  static create(
    statusCode: number,
    message: string,
    path: string,
    options?: {
      error?: string;
      code?: string;
      errors?: ValidationErrorItem[];
    }
  ): ApiErrorResponseDto {
    return new ApiErrorResponseDto(statusCode, message, path, options);
  }
}

/**
 * Metadata de paginación - DTO
 */
export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 100 })
  readonly total: number;

  @ApiProperty({ example: 1 })
  readonly page: number;

  @ApiProperty({ example: 10 })
  readonly limit: number;

  @ApiProperty({ example: 10 })
  readonly totalPages: number;

  @ApiProperty({ example: true })
  readonly hasNextPage: boolean;

  @ApiProperty({ example: false })
  readonly hasPrevPage: boolean;

  private constructor(meta: PaginationMeta) {
    this.total = meta.total;
    this.page = meta.page;
    this.limit = meta.limit;
    this.totalPages = meta.totalPages;
    this.hasNextPage = meta.hasNextPage;
    this.hasPrevPage = meta.hasPrevPage;
  }

  /**
   * Factory method para crear metadata
   */
  static create(total: number, page: number, limit: number): PaginationMetaDto {
    return new PaginationMetaDto(createPaginationMeta(total, page, limit));
  }
}

/**
 * Respuesta paginada estándar - type-safe
 */
export class PaginatedResponseDto<T> implements PaginatedResponse<T> {
  @ApiProperty({ example: true })
  readonly success: true = true;

  @ApiProperty({ isArray: true })
  readonly data: readonly T[];

  @ApiProperty({ type: PaginationMetaDto })
  readonly meta: PaginationMeta;

  private constructor(data: readonly T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }

  /**
   * Factory method para crear respuesta paginada
   */
  static create<T>(data: T[], total: number, page: number, limit: number): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, PaginationMetaDto.create(total, page, limit));
  }
}

/**
 * Respuesta de operación simple (create, update, delete)
 */
export class OperationResponseDto {
  @ApiProperty({ example: true })
  readonly success: boolean;

  @ApiProperty({ example: 'Operación completada exitosamente' })
  readonly message: string;

  @ApiPropertyOptional({ example: 'abc-123-def' })
  readonly id?: string;

  @ApiPropertyOptional()
  readonly timestamp?: string;

  private constructor(success: boolean, message: string, id?: string) {
    this.success = success;
    this.message = message;
    this.id = id;
    this.timestamp = new Date().toISOString();
  }

  static success(message: string, id?: string): OperationResponseDto {
    return new OperationResponseDto(true, message, id);
  }

  static failure(message: string): OperationResponseDto {
    return new OperationResponseDto(false, message);
  }
}

/**
 * Helpers para crear respuestas rápidamente - type-safe
 */
export const ApiResponses = {
  /**
   * Respuesta exitosa genérica
   */
  success: <T>(data: T, message?: string): ApiSuccessResponseDto<T> =>
    ApiSuccessResponseDto.of(data, message),

  /**
   * Respuesta de creación exitosa
   */
  created: <T>(data: T): ApiSuccessResponseDto<T> =>
    ApiSuccessResponseDto.of(data, 'Creado exitosamente'),

  /**
   * Respuesta de actualización exitosa
   */
  updated: <T>(data: T): ApiSuccessResponseDto<T> =>
    ApiSuccessResponseDto.of(data, 'Actualizado exitosamente'),

  /**
   * Respuesta de eliminación exitosa
   */
  deleted: (): OperationResponseDto => OperationResponseDto.success('Eliminado exitosamente'),

  /**
   * Respuesta paginada
   */
  paginated: <T>(data: T[], total: number, page: number, limit: number): PaginatedResponseDto<T> =>
    PaginatedResponseDto.create(data, total, page, limit),

  /**
   * Respuesta de error
   */
  error: (
    statusCode: number,
    message: string,
    path: string,
    options?: { error?: string; code?: string; errors?: ValidationErrorItem[] }
  ): ApiErrorResponseDto => ApiErrorResponseDto.create(statusCode, message, path, options),
};

// Re-exports para compatibilidad hacia atrás
export { ApiSuccessResponseDto as ApiSuccessResponse };
export { ApiErrorResponseDto as ApiErrorResponse };
export { PaginatedResponseDto as PaginatedResponse };
export { PaginationMetaDto as PaginatedResponseMeta };
export { OperationResponseDto as OperationResponse };
