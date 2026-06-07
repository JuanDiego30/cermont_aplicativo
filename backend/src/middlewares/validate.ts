/**
 * Generic Validation Middleware
 *
 * Uses Zod schemas from @cermont/shared-types as the single source of truth.
 * Validates request body, query, and params against Zod schemas.
 *
 * On failure, throws ValidationError (AppError subclass) which Express 5
 * auto-routes to the global error handler — no try/catch needed.
 *
 * EXPRESS 5 NOTE: req.query and req.params are readonly getters in Express 5.
 * Validated data is stored on req.validatedData[target] for downstream access.
 * Controllers should read from req.validatedData.query / req.validatedData.params
 * or re-parse with Zod (which is already the current pattern in controllers).
 *
 * Usage:
 *   router.post('/', validate(createOrderSchema), orderController.create)
 *   router.get('/', validate(getOrderSchema, 'query'), orderController.list)
 */

import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../common/errors/AppError";

type ValidationTarget = "body" | "query" | "params";

// Extend Express Request to hold validated data
declare global {
	namespace Express {
		interface Request {
			validatedData?: {
				body?: unknown;
				query?: unknown;
				params?: unknown;
			};
		}
	}
}

/**
 * Factory function to create validation middleware
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of request to validate (default: body)
 */
export function validate(schema: ZodTypeAny, target: ValidationTarget = "body") {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		const data = target === "body" ? req.body : target === "query" ? req.query : req.params;
		const result = await schema.safeParseAsync(data);

		if (!result.success) {
			const details = result.error.issues.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			}));

			throw new ValidationError("Validation failed", details);
		}

		// Store validated data for downstream middleware/controllers
		if (!req.validatedData) {
			req.validatedData = {};
		}
		req.validatedData[target] = result.data;

		// Express 5: req.body is still writable; req.query and req.params are readonly getters
		if (target === "body") {
			req.body = result.data;
		}

		next();
	};
}

/**
 * Convenience exports — explicit naming
 */
export const validateBody = (schema: ZodTypeAny) => validate(schema, "body");
export const validateQuery = (schema: ZodTypeAny) => validate(schema, "query");
export const validateParams = (schema: ZodTypeAny) => validate(schema, "params");
