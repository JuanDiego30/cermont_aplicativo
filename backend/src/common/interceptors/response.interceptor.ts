/**
 * Response Interceptor — NestJS Interceptor equivalent
 *
 * Ensures all API responses follow the standard envelope:
 *   { success: true, data: T, meta?: {...} }
 *   { success: false, error: { code, message, details? } }
 *
 * This is NOT a middleware — it's a helper that controllers use.
 * The actual envelope is enforced by sendSuccess/sendError in common/http/response.ts
 */

import type { Response } from "express";

export interface ApiResponse<T = unknown> {
	success: true;
	data: T;
	meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

export interface PaginationMeta {
	total: number;
	page: number;
	totalPages: number;
	limit: number;
}

export interface ApiPaginatedResponse<T> {
	success: true;
	data: T[];
	pagination: PaginationMeta;
}

/**
 * Send success response with standard envelope
 */
export function sendSuccess<T>(
	res: Response,
	data: T,
	statusCode: number = 200,
	meta?: Record<string, unknown>,
): void {
	const payload: ApiResponse<T> = {
		success: true,
		data,
		...(meta && { meta }),
	};
	res.status(statusCode).json(payload);
}

/**
 * Send error response with standard envelope
 */
export function sendError(
	res: Response,
	error: { code: string; message: string; details?: unknown },
	statusCode: number = 500,
): void {
	const payload: ApiErrorResponse = {
		success: false,
		error,
	};
	res.status(statusCode).json(payload);
}

/**
 * Send paginated response with standard envelope
 */
export function sendPaginated<T>(
	res: Response,
	data: T[],
	total: number,
	page: number,
	limit: number,
): void {
	res.setHeader("X-Total-Count", String(total));

	const payload: ApiPaginatedResponse<T> = {
		success: true,
		data,
		pagination: {
			total,
			page,
			totalPages: Math.ceil(total / limit),
			limit,
		},
	};
	res.status(200).json(payload);
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(res: Response, data: T): void {
	sendSuccess(res, data, 201);
}

/**
 * Send no content response (204)
 */
export function sendNoContent(res: Response): void {
	res.status(204).end();
}
