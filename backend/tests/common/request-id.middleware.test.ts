import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requestId } from "../../src/common/middlewares/request-id.middleware";
import { getRequestContext } from "../../src/common/observability/request-context";

function createRequestIdApp() {
	const app = express();
	app.use(requestId);
	app.get("/", (req, res) => {
		res.status(200).json({ requestId: req.requestId, requestContext: getRequestContext() });
	});
	return app;
}

describe("requestId middleware", () => {
	it("preserves a safe upstream correlation ID", async () => {
		const response = await request(createRequestIdApp())
			.get("/")
			.set("X-Request-Id", "edge-01:trace_123");

		expect(response.status).toBe(200);
		expect(response.headers["x-request-id"]).toBe("edge-01:trace_123");
		expect(response.body.requestId).toBe("edge-01:trace_123");
		expect(response.body.requestContext).toMatchObject({
			status: "available",
			context: {
				requestId: "edge-01:trace_123",
				userAgent: expect.any(String),
			},
		});
	});

	it("replaces unsafe or oversized upstream IDs", async () => {
		const response = await request(createRequestIdApp())
			.get("/")
			.set("X-Request-Id", "x".repeat(200));

		expect(response.status).toBe(200);
		expect(response.headers["x-request-id"]).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
		expect(response.headers["x-request-id"]).not.toBe("x".repeat(200));
	});
});
