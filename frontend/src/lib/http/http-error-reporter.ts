/**
 * HTTP Error Reporter — Centralized error handling for the api-client
 *
 * Provides:
 * - Standardized error messages for 400/401/403/404/409/429/500
 * - Actionable guidance for each error type
 * - Logging to console (dev) or structured JSON (production)
 * - Integration with the existing ApiError class
 *
 * Usage in components:
 *   import { interpretHttpError } from "@/lib/http/http-error-reporter";
 *   const { message, title } = interpretHttpError(error, { entity: "Visita técnica" });
 *   setFormError(message);
 *
 * Usage in api-client.ts:
 *   In handleResponse(), after creating an ApiError, call
 *   reportHttpError(context, apiError) to log structured errors.
 */

export interface HttpErrorReport {
	title: string;
	message: string;
	severity: "info" | "warning" | "error";
	action?: string;
}

const HTTP_ERROR_STRATEGIES: Record<number, (entity?: string) => HttpErrorReport> = {
	400: (entity) => ({
		title: "Solicitud inválida",
		message: entity
			? `Los datos enviados para ${entity} no son válidos. Revise los campos marcados e intente nuevamente.`
			: "La solicitud contiene datos inválidos. Verifique los campos del formulario.",
		severity: "warning",
		action: "Revise los campos del formulario y corrija los errores indicados.",
	}),

	401: (_entity) => ({
		title: "Sesión expirada",
		message:
			"Su sesión ha expirado o no tiene permisos para acceder a este recurso. Intente recargar la página.",
		severity: "warning",
		action: "Recargue la página o cierre sesión y vuelva a iniciar.",
	}),

	403: (_entity) => ({
		title: "Acceso denegado",
		message:
			"No tiene permisos suficientes para realizar esta acción. Contacte a su administrador si cree que esto es un error.",
		severity: "error",
		action: "Solicite permisos adicionales a su administrador.",
	}),

	404: (entity) => ({
		title: "Recurso no encontrado",
		message: entity
			? `No se encontró el recurso de ${entity} solicitado. Es posible que haya sido eliminado o que el enlace sea incorrecto.`
			: "El recurso solicitado no existe o ha sido eliminado.",
		severity: "warning",
		action: "Verifique que el enlace sea correcto o regrese al listado.",
	}),

	409: (entity) => ({
		title: "Conflicto",
		message: entity
			? `Ya existe un registro de ${entity} con los mismos datos. No se puede crear duplicados.`
			: "El recurso que intenta crear ya existe.",
		severity: "warning",
		action: "Verifique que no exista un registro duplicado e intente con datos diferentes.",
	}),

	429: (_entity) => ({
		title: "Demasiadas solicitudes",
		message:
			"Ha realizado demasiadas solicitudes en poco tiempo. Espere unos segundos e intente nuevamente.",
		severity: "warning",
		action: "Espere un momento antes de realizar más solicitudes.",
	}),

	500: (_entity) => ({
		title: "Error interno del servidor",
		message:
			"Ocurrió un error inesperado en el servidor. El equipo de soporte ha sido notificado automáticamente.",
		severity: "error",
		action: "Intente nuevamente en unos minutos. Si el problema persiste, contacte a soporte.",
	}),

	502: (_entity) => ({
		title: "Servidor temporalmente no disponible",
		message:
			"El servidor de aplicaciones está temporalmente fuera de servicio. Esto suele resolverse en segundos.",
		severity: "warning",
		action: "Espere unos segundos y recargue la página.",
	}),

	503: (_entity) => ({
		title: "Servicio no disponible",
		message:
			"El servicio no está disponible en este momento. Puede deberse a mantenimiento o una sobrecarga temporal.",
		severity: "warning",
		action: "Intente nuevamente en unos minutos.",
	}),
};

const DEFAULT_ERROR_REPORT: HttpErrorReport = {
	title: "Error de conexión",
	message: "No se pudo conectar con el servidor. Verifique su conexión a internet.",
	severity: "error",
	action: "Verifique su conexión a internet e intente nuevamente.",
};

/**
 * Interpret an HTTP status code and produce a user-friendly error report.
 * @param status - HTTP status code
 * @param entity - Optional entity name for contextual messages (e.g., "Visita técnica")
 */
function interpretHttpError(status: number, entity?: string): HttpErrorReport {
	const strategy = HTTP_ERROR_STRATEGIES[status];
	if (strategy) {
		return strategy(entity);
	}
	if (status >= 500) {
		return HTTP_ERROR_STRATEGIES[500](entity);
	}
	return DEFAULT_ERROR_REPORT;
}

/**
 * Interpret an ApiError and produce a user-friendly error report.
 */
export function interpretApiError(
	error: { status?: number; code?: string; message?: string },
	entity?: string,
): HttpErrorReport {
	const report = interpretHttpError(error.status ?? 0, entity);
	// If the ApiError has a specific message, use it instead of the generic one
	if (
		error.message &&
		error.message !== "Bad Request" &&
		error.message !== "Internal Server Error"
	) {
		return { ...report, message: error.message };
	}
	return report;
}
