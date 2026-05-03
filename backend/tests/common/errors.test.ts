import { describe, expect, it } from "vitest";
import {
	AppError,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	RateLimitError,
	UnauthorizedError,
	UnprocessableError,
	ValidationError,
} from "@/common/errors";
import { ERROR_CODES } from "@/common/errors/error-codes";

describe("common errors", () => {
	it("uses centralized error codes in subclasses", () => {
		expect(new BadRequestError().code).toBe(ERROR_CODES.BAD_REQUEST);
		expect(new ValidationError().code).toBe(ERROR_CODES.VALIDATION_ERROR);
		expect(new UnauthorizedError().code).toBe(ERROR_CODES.UNAUTHORIZED);
		expect(new ForbiddenError().code).toBe(ERROR_CODES.FORBIDDEN);
		expect(new NotFoundError().code).toBe(ERROR_CODES.NOT_FOUND);
		expect(new ConflictError().code).toBe(ERROR_CODES.CONFLICT);
		expect(new UnprocessableError().code).toBe(ERROR_CODES.BUSINESS_RULE_VIOLATION);
		expect(new RateLimitError().code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
	});

	it("serializes operational error payloads consistently", () => {
		const error = new AppError("Boom", 503, ERROR_CODES.INTERNAL_ERROR, { retryAfter: 10 });

		expect(error.toJSON()).toEqual({
			success: false,
			error: {
				code: ERROR_CODES.INTERNAL_ERROR,
				message: "Boom",
				details: { retryAfter: 10 },
			},
		});
	});
});
