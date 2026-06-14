import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index";

describe("health routes", () => {
	it("reports process liveness independently from MongoDB readiness", async () => {
		const response = await request(app).get("/api/health/live");

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			status: "ok",
			check: "liveness",
			version: expect.any(String),
			timestamp: expect.any(String),
		});
	});

	it("reports readiness with database diagnostics", async () => {
		const response = await request(app).get("/api/health/ready");

		expect([200, 503]).toContain(response.status);
		expect(response.body).toMatchObject({
			check: "readiness",
			db: expect.any(String),
			readyState: expect.any(Number),
			version: expect.any(String),
		});
	});

	it("supports HEAD probes for liveness and readiness", async () => {
		const [live, ready] = await Promise.all([
			request(app).head("/api/health/live"),
			request(app).head("/api/health/ready"),
		]);

		expect(live.status).toBe(200);
		expect([200, 503]).toContain(ready.status);
		expect(live.text).toBeUndefined();
		expect(ready.text).toBeUndefined();
	});
});
