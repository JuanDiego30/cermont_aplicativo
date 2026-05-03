import { describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/common/errors";
import { authorize } from "@/common/guards/roles.guard";

describe("authorize guard", () => {
	it("returns UnauthorizedError when user context is missing", () => {
		const next = vi.fn();
		const guard = authorize("gerente");

		guard({} as never, {} as never, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
	});

	it("returns ForbiddenError when the role is not allowed", () => {
		const next = vi.fn();
		const guard = authorize("gerente", "residente");

		guard(
			{ user: { _id: "user-id", email: "user@cermont.com", role: "tecnico" } } as never,
			{} as never,
			next,
		);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
	});

	it("calls next without error for allowed roles", () => {
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
});
