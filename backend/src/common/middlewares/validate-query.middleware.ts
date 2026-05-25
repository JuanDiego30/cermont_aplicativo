/**
 * validate-query.middleware.ts — Query string validation (DOC-04, sección 8)
 *
 * Used to validate URL query parameters against a Zod schema.
 * Complements validate-body for complete request validation.
 *
 * Usage:
 *   router.get('/orders', validateQuery(listOrdersQuerySchema), listOrders)
 */

import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { BadRequestError } from "../errors";

/**
 * Validate request.query against a Zod schema.
 * Throws BadRequestError if validation fails (Express 5 handles the async throw).
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
		const result = schema.safeParse(req.query);
		if (!result.success) {
			const message = result.error.issues
				.map((i) => `${i.path.join(".")}: ${i.message}`)
				.join("; ");
			throw new BadRequestError(message, "INVALID_QUERY_PARAMS");
		}
		// Replace req.query with the parsed (coerced) value for type safety
		(req as Request & { parsedQuery: T }).parsedQuery = result.data;
		next();
	};
}
