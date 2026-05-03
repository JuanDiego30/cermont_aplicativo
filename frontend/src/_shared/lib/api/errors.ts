/**
 * API Error Response Helper
 * Estandariza el formato de respuestas de error para todas las rutas API.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createLogger } from "@/_shared/lib/monitoring/logger";
import { captureException } from "@/_shared/lib/monitoring/sentry";
import { ApiErrorCode, type ApiErrorContext, type ApiErrorResponse } from "./error-types";

export type { ApiErrorContext, ApiErrorResponse } from "./error-types";
export { ApiErrorCode } from "./error-types";

function attachRequestId(
	response: NextResponse<ApiErrorResponse>,
	_requestId: string,
): NextResponse<ApiErrorResponse> {
	return response;
}

const logger = createLogger("API:errors");

function createErrorResponse(
	message: string,
	status: number,
	code: ApiErrorCode,
	details?: Record<string, unknown>,
	requestId?: string,
): NextResponse<ApiErrorResponse> {
	const response: ApiErrorResponse = {
		error: code,
		message,
		code,
		details,
		timestamp: new Date().toISOString(),
		...(requestId ? { requestId } : {}),
	};
	const nextResponse = NextResponse.json(response, { status }) as NextResponse<ApiErrorResponse>;
	return requestId ? attachRequestId(nextResponse, requestId) : nextResponse;
}

export function handleZodError(error: ZodError): NextResponse<ApiErrorResponse> {
	const details: Record<string, unknown> = {};
	for (const [field, issues] of Object.entries(error.flatten().fieldErrors)) {
		details[field] = issues || [];
	}
	logger.warn("Validation error", { details });
	return createErrorResponse(
		"Los datos proporcionados no son válidos",
		422,
		ApiErrorCode.VALIDATION_ERROR,
		details,
	);
}

export function unauthorized(message = "Credenciales no válidas"): NextResponse<ApiErrorResponse> {
	return createErrorResponse(message, 401, ApiErrorCode.UNAUTHORIZED);
}

export function forbidden(
	message = "No tienes permiso para realizar esta acción",
): NextResponse<ApiErrorResponse> {
	return createErrorResponse(message, 403, ApiErrorCode.FORBIDDEN);
}

export function notFound(resource: string, identifier?: string): NextResponse<ApiErrorResponse> {
	const message = identifier
		? `${resource} con identificador '${identifier}' no encontrado`
		: `${resource} no encontrado`;
	return createErrorResponse(message, 404, ApiErrorCode.NOT_FOUND);
}

export function conflict(message: string): NextResponse<ApiErrorResponse> {
	return createErrorResponse(message, 409, ApiErrorCode.CONFLICT);
}

export function badRequest(
	message: string,
	details?: Record<string, unknown>,
): NextResponse<ApiErrorResponse> {
	return createErrorResponse(message, 400, ApiErrorCode.BAD_REQUEST, details);
}

export function internalError(
	message = "Error interno del servidor",
	error?: unknown,
	context?: ApiErrorContext,
): NextResponse<ApiErrorResponse> {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const requestId = typeof context?.requestId === "string" ? context.requestId : undefined;
	logger.error("Internal server error", {
		requestId,
		error: errorMessage,
		stack: error instanceof Error ? error.stack : undefined,
		...context,
	});
	void captureException(error, { requestId, ...context });
	return createErrorResponse(message, 500, ApiErrorCode.INTERNAL_ERROR, undefined, requestId);
}

export function rateLimited(
	message = "Demasiadas solicitudes. Intenta más tarde.",
): NextResponse<ApiErrorResponse> {
	return createErrorResponse(message, 429, ApiErrorCode.RATE_LIMITED);
}

export function handleApiError(
	error: unknown,
	context?: ApiErrorContext,
): NextResponse<ApiErrorResponse> {
	if (error instanceof ZodError) {
		return handleZodError(error);
	}
	if (error instanceof NextResponse) {
		return error;
	}
	if (error instanceof Error) {
		if (error.message.includes("no encontrado") || error.message.includes("not found")) {
			return notFound("Recurso", error.message);
		}
		if (error.message.includes("no autorizado") || error.message.includes("unauthorized")) {
			return unauthorized();
		}
		if (error.message.includes("prohibido") || error.message.includes("forbidden")) {
			return forbidden();
		}
		if (error.message.includes("ya existe") || error.message.includes("already exists")) {
			return conflict(error.message);
		}
	}
	return internalError("Ocurrió un error procesando la solicitud", error, context);
}

export async function withErrorHandling<T>(
	handler: () => Promise<T> | T,
	context?: ApiErrorContext,
): Promise<NextResponse<ApiErrorResponse> | T> {
	try {
		return await handler();
	} catch (error) {
		return handleApiError(error, context) as T;
	}
}
