/**
 * Shared API Types - Query Parameters and Common Types
 * 
 * This file defines shared types used across API clients to avoid `any`
 * and ensure type safety in HTTP request parameters.
 */

/**
 * Type-safe query parameters for GET requests.
 * Allows primitive types, dates, arrays, and any other serializable values
 * (like DTOs with enum properties).
 */
export type QueryParams = Record<
    string,
    string | number | boolean | Date | Array<string | number> | null | undefined
> | Record<string, unknown>;

/**
 * Standard paginated response structure from API.
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Standard API action response (success/message pattern).
 */
export interface ActionResponse<T = void> {
    success: boolean;
    message: string;
    data?: T;
}

/**
 * Standard error response format from backend.
 */
export interface ApiError {
    message: string;
    status: number;
    error?: string;
    details?: Record<string, string[]>;
}

/**
 * Base pagination query params.
 */
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    limit?: number;
}

/**
 * Base sort params.
 */
export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
