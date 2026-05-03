import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/common/errors";
import {
	authorize,
	authorizeMinimum,
	authorizeOwnerOrAdmin,
} from "@/middlewares/authorize.middleware";

describe("authorize middleware", () => {
	it("throws UnauthorizedError when the user context is missing", () => {
		const next = vi.fn();
		const guard = authorize("gerente");

		expect(() => guard({} as never, {} as never, next)).toThrow(UnauthorizedError);
		expect(next).not.toHaveBeenCalled();
	});

	it("throws ForbiddenError when the role is not allowed", () => {
		const next = vi.fn();
		const guard = authorize("gerente", "residente");

		expect(() =>
			guard(
				{ user: { _id: "user-id", email: "user@cermont.com", role: "tecnico" } } as never,
				{} as never,
				next,
			),
		).toThrow(ForbiddenError);
		expect(next).not.toHaveBeenCalled();
	});

	it("allows matching roles to continue the request", () => {
		const next = vi.fn();
		const guard = authorize("gerente", "residente");

		guard(
			{ user: { _id: "user-id", email: "user@cermont.com", role: "gerente" } } as never,
			{} as never,
			next,
		);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith();
	});

	it("enforces the minimum role hierarchy", () => {
		const next = vi.fn();
		const guard = authorizeMinimum("supervisor");

		expect(() =>
			guard(
				{ user: { _id: "user-id", email: "tech@cermont.com", role: "tecnico" } } as never,
				{} as never,
				next,
			),
		).toThrow(ForbiddenError);

		guard(
			{ user: { _id: "user-id", email: "boss@cermont.com", role: "gerente" } } as never,
			{} as never,
			next,
		);

		expect(next).toHaveBeenCalledTimes(1);
	});

	it("allows the owner or admin to proceed", () => {
		const next = vi.fn();
		const guard = authorizeOwnerOrAdmin("userId");

		guard(
			{
				params: { userId: "user-id" },
				user: { _id: "user-id", email: "owner@cermont.com", role: "tecnico" },
			} as never,
			{} as never,
			next,
		);

		guard(
			{
				params: { userId: "someone-else" },
				user: { _id: "admin-id", email: "admin@cermont.com", role: "gerente" },
			} as never,
			{} as never,
			next,
		);

		expect(next).toHaveBeenCalledTimes(2);
	});
});
