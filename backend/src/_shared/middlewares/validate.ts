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
import { ValidationError } from "../common/errors";

type ValidationTarget = "body" | "query" | "params";

function readRequestTarget(
	req: Request,
	target: ValidationTarget,
): Request["body"] | Request["query"] | Request["params"] {
	if (target === "body") {
		return req.body;
	}

	if (target === "query") {
		return req.query;
	}

	return req.params;
}

function writeRequestTarget(
	req: Request,
	target: ValidationTarget,
	data: Request["body"] | Request["query"] | Request["params"],
): void {
	if (target === "body") {
		req.body = data as Request["body"];
		return;
	}

	if (target === "query") {
		Object.defineProperty(req, "query", {
			value: data as Request["query"],
			writable: true,
			configurable: true,
			enumerable: true,
		});
		return;
	}

	req.params = data as Request["params"];
}

/**
 * Factory function to create validation middleware
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of request to validate (default: body)
 */
export function validate(schema: ZodTypeAny, target: ValidationTarget = "body") {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		const data = readRequestTarget(req, target);
		const result = await schema.safeParseAsync(data);

		if (!result.success) {
			const details = result.error.issues.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			}));

			throw new ValidationError("Validation failed", { issues: details });
		}

		// Replace with parsed data, including schema defaults and transformations.
		writeRequestTarget(req, target, result.data);

		next();
	};
}

/**
 * Convenience exports — explicit naming
 */
export const validateBody = (schema: ZodTypeAny) => validate(schema, "body");
export const validateQuery = (schema: ZodTypeAny) => validate(schema, "query");
export const validateParams = (schema: ZodTypeAny) => validate(schema, "params");
