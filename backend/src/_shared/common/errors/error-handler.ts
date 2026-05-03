import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { trackErrorMetric } from "../observability/error-metrics";
import { createLogger } from "../utils";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./error-codes";

const log = createLogger("error-handler");

/**
 * Minimal MongoDB/Mongoose error shape.
 * Only the fields inspected in the error handler are declared.
 */
interface MongoError extends Error {
	code?: number;
}

interface ZodIssueDetail {
	field: string;
	message: string;
}

interface ErrorResponseBody {
	success: false;
	error: {
		code: string;
		message: string;
		details?: ZodIssueDetail[];
		stack?: string;
	};
}

function buildErrorBody(
	code: string,
	message: string,
	options: { details?: ZodIssueDetail[]; stack?: string } = {},
): ErrorResponseBody {
	return {
		success: false,
		error: {
			code,
			message,
			...(options.details && { details: options.details }),
			...(options.stack && { stack: options.stack }),
		},
	};
}

/**
 * Check if error is a database connection error
 */
function isDatabaseConnectionError(err: Error): boolean {
  return (
    err.message?.includes("ECONNREFUSED") ||
    err.message?.includes("MongoNetworkError") ||
    err.message?.includes("connection") ||
    err.name === "MongooseError"
  );
}

/**
 * Global Error Handler Middleware
 *
 * Fulfills Security-by-Design by hiding internal stacks in production
 * and centralizing domain error responses for Express 5.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId ?? (req.headers["x-request-id"] as string | undefined);
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
    const details: ZodIssueDetail[] = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    log.warn("ZodError", {
      path: req.path,
      method,
      errors: err.issues.length,
      requestId,
    });

    res
      .status(400)
      .json(buildErrorBody(ERROR_CODES.VALIDATION_ERROR, "Validation failed", { details }));
    return;
  }

  // 3. Database Errors (Mongoose/MongoDB)
  const dbError = err as MongoError;
  const isMongooseError =
    dbError.name === "ValidationError" || dbError.name === "CastError" || dbError.code === 11000;

  if (isMongooseError) {
    const isConflict = dbError.code === 11000;
    const statusCode = isConflict ? 409 : 400;
    const errorCode = isConflict ? ERROR_CODES.CONFLICT : ERROR_CODES.VALIDATION_ERROR;
    const message = isConflict ? "Resource already exists" : "Database validation failed";

    log.warn("DatabaseError", {
      name: dbError.name,
      code: dbError.code,
      path: req.path,
      method,
      requestId,
    });

    res.status(statusCode).json(buildErrorBody(errorCode, message));
    return;
  }

  // 3.5 Network Connection Errors (MongoDB ECONNREFUSED, etc.)
  if (isDatabaseConnectionError(err)) {
    log.error("Database connection error", {
      message: err.message,
      name: err.name,
      path: req.path,
      method,
      requestId,
    });

    res.status(503).json(
      buildErrorBody("SERVICE_UNAVAILABLE", "Service temporarily unavailable. Please try again later.")
    );
    return;
  }

  // 4. Critical / Unhandled Errors
  log.error("Unhandled critical error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method,
    requestId,
  });

  const isProduction = env.NODE_ENV === "production";
  res
    .status(500)
    .json(
      buildErrorBody(
        ERROR_CODES.INTERNAL_ERROR,
        isProduction ? "Internal server error" : err.message,
        { ...(!isProduction && { stack: err.stack }) },
      ),
    );
}
