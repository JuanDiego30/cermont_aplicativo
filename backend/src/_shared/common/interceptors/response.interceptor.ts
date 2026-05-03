/**
 * Response Interceptor
 *
 * Ensures all API responses follow the standard envelope:
 *   { success: true, data: T, meta?: Record<string, unknown> }
 *   { success: false, error: { code, message, details? } }
 */

import type { Response } from "express";

export interface ApiResponse<T> {
	success: true;
	data: T;
	meta?: Record<string, unknown>;
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

export function sendCreated<T>(res: Response, data: T): void {
	sendSuccess(res, data, 201);
}
