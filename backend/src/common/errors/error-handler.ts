import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { trackErrorMetric } from "../observability/error-metrics";
import { createLogger } from "../utils/logger";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./error-codes";

const log = createLogger("error-handler");

/**
 * Minimal MongoDB/Mongoose error shape — avoids type assertions
 * Only the fields we actually inspect in the error handler.
 */
interface MongoError extends Error {
	code?: number;
}

function handleDatabaseError(
	dbError: MongoError,
	req: Request,
	res: Response,
	method: string,
	requestId: string,
): void {
	const isDbConflict = dbError.code === 11000;
	const statusCode = isDbConflict ? 409 : 400;
	const errorCode = isDbConflict ? ERROR_CODES.CONFLICT : ERROR_CODES.VALIDATION_FAILED;
	const message = isDbConflict ? "Resource already exists" : "Database validation failed";

	log.warn("DatabaseError", {
		path: req.path,
		method,
		requestId,
		name: dbError.name,
		...(typeof dbError.code === "number" ? { code: dbError.code } : {}),
	});

	res.status(statusCode).json({
		success: false,
		error: {
			code: errorCode,
			message,
		},
	});
}

/**
 * Global Error Handler Middleware
 *
 * Fulfills Security-by-Design by hiding internal stacks and centralizing
 * domain error responses for Express 5.
 */
export function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	// Express 5 requires exactly 4 parameters for error middleware
	_next: NextFunction,
): void {
	const requestId = (req.requestId as string) || (req.headers["x-request-id"] as string);
	const method = req.method;
	const path = req.originalUrl || req.path;

	trackErrorMetric(method, path);

	// 1. Operational Errors (AppError)
	if (err instanceof AppError) {
		log.warn("AppError", {
			code: err.code,
			message: err.message,
			statusCode: err.statusCode,
			path: req.path,
			method,
			requestId,
		});

		res.status(err.statusCode).json(err.toJSON());
		return;
	}

	// 2. Validation Errors (Zod)
	if (err instanceof ZodError) {
		const details = err.issues.map((e) => ({
			field: e.path.join("."),
			message: e.message,
		}));

		log.warn("ZodError", { path: req.path, method, errors: err.issues.length, requestId });

		res.status(400).json({
			success: false,
			error: {
				code: ERROR_CODES.VALIDATION_FAILED,
				message: "Validation failed",
				details,
			},
		});
		return;
	}

	// 3. Database Errors (Mongoose/MongoDB)
	const dbError = err as MongoError;
	const isDbConflict = dbError.code === 11000;
	const isDbValidation = dbError.name === "ValidationError" || dbError.name === "CastError";
	if (isDbValidation || isDbConflict) {
		handleDatabaseError(dbError, req, res, method, requestId);
		return;
	}

	// 4. Critical / Unhandled Errors
	const errorStack = err.stack || "";
	log.error("Unhandled critical error:", {
		message: err.message,
		path: req.path,
		method,
		requestId,
		stack: errorStack,
	});

	// Hide internal details in production
	res.status(500).json({
		success: false,
		error: {
			code: ERROR_CODES.INTERNAL_ERROR,
			message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
			...(env.NODE_ENV !== "production" && { stack: err.stack }),
		},
	});
}
