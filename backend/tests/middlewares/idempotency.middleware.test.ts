/**
 * Idempotency Middleware Tests
 *
 * Covers:
 * - Idempotent method filtering (POST/PATCH/PUT/DELETE only)
 * - Cache hit returns existing response without executing handler
 * - Cache miss executes handler and stores response
 * - requireIdempotencyKey validation (missing/invalid key)
 * - Only 2xx responses are cached
 * - Non-idempotent methods (GET) pass through
 */

import { describe, expect, it, vi } from "vitest";

// Mock IdempotencyEntry model
const mockFindOne = vi.fn();
const mockCreate = vi.fn();

vi.mock("../../src/models/IdempotencyEntry", () => ({
	IdempotencyEntry: {
		findOne: (...args: unknown[]) => mockFindOne(...args),
		create: (...args: unknown[]) => mockCreate(...args),
	},
}));

// Import after mock
const { idempotency, requireIdempotencyKey, generateIdempotencyKey } = await import(
	"../../src/middlewares/idempotency.middleware"
);

describe("idempotency middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function mockReq(overrides: Record<string, unknown> = {}) {
		return {
			method: "POST",
			path: "/api/orders",
			headers: { "idempotency-key": "test-key-123" },
			user: { _id: "user-1" },
			...overrides,
		} as never;
	}

	function mockRes() {
		const status = vi.fn().mockReturnThis();
		const json = vi.fn().mockReturnThis();
		const on = vi.fn();
		const once = vi.fn();
		const end = vi.fn();
		return {
			status,
			json,
			on,
			once,
			end,
			statusCode: 200,
		} as never;
	}

	describe("idempotency()", () => {
		it("passes through for GET requests", async () => {
			const req = mockReq({ method: "GET" });
			const res = mockRes();
			const next = vi.fn();

			await idempotency()(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(mockFindOne).not.toHaveBeenCalled();
		});

		it("passes through when no idempotency key is present", async () => {
			const req = mockReq({ headers: {} });
			const res = mockRes();
			const next = vi.fn();

			await idempotency()(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(mockFindOne).not.toHaveBeenCalled();
		});

		it("returns cached response when key exists", async () => {
			mockFindOne.mockResolvedValueOnce({
				statusCode: 200,
				responseBody: JSON.stringify({ success: true, data: { id: "order-1" } }),
			});

			const req = mockReq();
			const res = mockRes();
			const next = vi.fn();

			await idempotency()(req, res, next);

			expect(mockFindOne).toHaveBeenCalledWith({
				key: expect.stringMatching(/.+/),
				method: "POST",
				path: "/api/orders",
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: "order-1" } });
			expect(next).not.toHaveBeenCalled();
		});

		it("executes handler and captures response on first request", async () => {
			mockFindOne.mockResolvedValueOnce(null);
			mockCreate.mockResolvedValueOnce({});

			const req = mockReq();
			const res = mockRes();
			const next = vi.fn();

			// Simulate downstream res.json call
			const resTyped = res as {
				json: ReturnType<typeof vi.fn>;
				once: ReturnType<typeof vi.fn>;
				statusCode: number;
			};
			resTyped.json.mockImplementation(function intercepted(this: unknown, _body: unknown) {
				// Simulate the finish event after json is called
				const finishCb = resTyped.once.mock.calls[0]?.[1];
				if (finishCb) {
					finishCb();
				}
				return this;
			});

			await idempotency()(req, resTyped, next);

			expect(next).toHaveBeenCalledTimes(1);
			expect(resTyped.once).toHaveBeenCalledTimes(1);
			expect(resTyped.once.mock.calls[0]?.[0]).toBe("finish");
			expect(typeof resTyped.once.mock.calls[0]?.[1]).toBe("function");
		});

		it("does NOT cache non-2xx responses", async () => {
			mockFindOne.mockResolvedValueOnce(null);

			const req = mockReq();
			const res = mockRes() as {
				status: ReturnType<typeof vi.fn>;
				json: ReturnType<typeof vi.fn>;
				once: ReturnType<typeof vi.fn>;
				statusCode: number;
			};
			res.statusCode = 400;
			const next = vi.fn();

			const finishCallback = vi.fn();
			res.once.mockImplementation((_event: string, cb: () => void) => {
				finishCallback.mockImplementation(cb);
			});

			await idempotency()(req, res, next);

			// Manually trigger finish to check that create is NOT called for 4xx
			finishCallback();
			expect(mockCreate).not.toHaveBeenCalled();
		});
	});

	describe("requireIdempotencyKey", () => {
		it("passes when key is present and valid", () => {
			const req = mockReq();
			const next = vi.fn();
			requireIdempotencyKey(req, {} as never, next);
			expect(next).toHaveBeenCalledWith();
		});

		it("rejects when key is missing", () => {
			const req = mockReq({ headers: {} });
			const next = vi.fn();
			requireIdempotencyKey(req, {} as never, next);
			expect(next).toHaveBeenCalled();
			const error = next.mock.calls[0][0] as Error & { statusCode: number };
			expect(error.statusCode).toBe(400);
			expect(error.message).toContain("required");
		});

		it("rejects when key has invalid characters", () => {
			const req = mockReq({
				headers: { "idempotency-key": "key with spaces!!" },
			});
			const next = vi.fn();
			requireIdempotencyKey(req, {} as never, next);
			expect(next).toHaveBeenCalled();
			const error = next.mock.calls[0][0] as Error & { statusCode: number };
			expect(error.statusCode).toBe(400);
			expect(error.message).toContain("URL-safe");
		});
	});

	describe("generateIdempotencyKey", () => {
		it("generates a valid UUID key", () => {
			const key = generateIdempotencyKey();
			expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
		});

		it("generates unique keys on each call", () => {
			const key1 = generateIdempotencyKey();
			const key2 = generateIdempotencyKey();
			expect(key1).not.toBe(key2);
		});
	});
});
