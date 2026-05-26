/**
 * Generic Validation Middleware
 *
 * Uses Zod schemas from @cermont/shared-types as the single source of truth.
 * Validates request body, query, and params against Zod schemas.
 *
 * On failure, throws ValidationError (AppError subclass) which Express 5
 * auto-routes to the global error handler — no try/catch needed.
 *
 * Usage:
 *   router.post('/', validate(createOrderSchema), orderController.create)
 *   router.get('/', validate(getOrderSchema, 'query'), orderController.list)
 */

import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../common/errors/AppError";

type ValidationTarget = "body" | "query" | "params";

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

		// Replace with parsed data (includes defaults and transformations)
		if (target === "body") {
			req.body = result.data as Request["body"];
		} else if (target === "query") {
			const query = req.query as Record<string, unknown>;
			Object.keys(query).forEach((key) => {
				delete query[key];
			});
			Object.assign(query, result.data as Record<string, unknown>);
		} else {
			const params = req.params as Record<string, unknown>;
			Object.keys(params).forEach((key) => {
				delete params[key];
			});
			Object.assign(params, result.data as Record<string, unknown>);
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
