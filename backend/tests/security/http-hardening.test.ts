import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index";
import { createAuthLimiter } from "../../src/middlewares/rate-limiter";

describe("HTTP security hardening", () => {
	it("limits the sixth credential attempt and returns Retry-After", async () => {
		const isolatedApp = express();
		isolatedApp.use(express.json());
		isolatedApp.use(createAuthLimiter(5));
		isolatedApp.post("/login", (_req, res) => {
			res.status(401).json({
				success: false,
				error: { code: "UNAUTHORIZED", message: "Invalid credentials" },
			});
		});

		for (let attempt = 1; attempt <= 5; attempt += 1) {
			const response = await request(isolatedApp).post("/login").send({
				email: "security-test@cermont.com",
				password: "InvalidPassword123!",
			});
			expect(response.status).toBe(401);
		}

		const blocked = await request(isolatedApp).post("/login").send({
			email: "security-test@cermont.com",
			password: "InvalidPassword123!",
		});

		expect(blocked.status).toBe(429);
		expect(blocked.headers["retry-after"]).toBeDefined();
		expect(blocked.body).toEqual({
			success: false,
			error: {
				code: "RATE_LIMIT_EXCEEDED",
				message: "Demasiadas solicitudes. Intenta nuevamente más tarde.",
			},
		});
	});

	it("keeps automated test traffic from exhausting the shared auth limiter", async () => {
		const isolatedApp = express();
		isolatedApp.use(express.json());
		isolatedApp.use(createAuthLimiter());
		isolatedApp.post("/login", (_req, res) => {
			res.status(401).json({ success: false });
		});

		for (let attempt = 1; attempt <= 6; attempt += 1) {
			const response = await request(isolatedApp).post("/login").send({
				email: "e2e-test@cermont.test",
				password: "InvalidPassword123!",
			});
			expect(response.status).toBe(401);
		}
	});

	it("rejects an unauthorized CORS origin without reflecting it", async () => {
		const response = await request(app)
			.get("/api/health")
			.set("Origin", "https://malicious-site.example");

		expect(response.status).toBe(403);
		expect(response.headers["access-control-allow-origin"]).toBeUndefined();
		expect(response.body).toMatchObject({
			success: false,
			error: { code: "FORBIDDEN" },
		});
	});

	it("returns CSP, anti-sniffing, frame denial, and allowed CORS headers", async () => {
		const response = await request(app).get("/api/health").set("Origin", "http://localhost:3000");

		expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
		expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
		expect(response.headers["x-content-type-options"]).toBe("nosniff");
		expect(response.headers["x-frame-options"]).toBe("DENY");
		expect(response.headers["referrer-policy"]).toBe("no-referrer");
	});
});
