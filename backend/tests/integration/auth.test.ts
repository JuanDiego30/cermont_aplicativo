import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/index";
import { createTestUser, getAuthHeader } from "./integration.test-utils";

describe("Auth Integration Tests", () => {
	const testUser = {
		name: "Auth Test User",
		email: `auth-${Date.now()}@example.com`,
		password: "Password123!",
		role: "tecnico",
	};

	it("should register a new user via /api/users (requires manager)", async () => {
		const admin = await createTestUser({ role: "gerente" });
		const authHeader = getAuthHeader(admin);

		const response = await request(app)
			.post("/api/users")
			.set("Authorization", authHeader)
			.send(testUser);

		expect(response.status).toBe(201);
		expect(response.body.success).toBe(true);
		expect(response.body.data.email).toBe(testUser.email);
	});

	it("should login and return tokens", async () => {
		await createTestUser({ email: "login@example.com", password: "Password123!" });

		const response = await request(app).post("/api/auth/login").send({
			email: "login@example.com",
			password: "Password123!",
		});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.data.accessToken).toBeDefined();

		const cookies = response.get("Set-Cookie");
		expect(cookies).toBeDefined();
		const hasRefreshToken = cookies?.some((c) => c.includes("refreshToken"));
		expect(hasRefreshToken).toBe(true);
	});

	it("should login when the submitted email uses uppercase letters", async () => {
		await createTestUser({ email: "gerencia@cermont.co", password: "Cermon2026!" });

		const response = await request(app).post("/api/auth/login").send({
			email: " Gerencia@Cermont.co ",
			password: "Cermon2026!",
		});

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.data.user.email).toBe("gerencia@cermont.co");

		const cookies = response.get("Set-Cookie");
		expect(cookies?.some((c) => c.includes("refreshToken"))).toBe(true);
	});

	it("should get current user profile /api/auth/me", async () => {
		const user = await createTestUser({ email: "me@example.com" });
		const token = getAuthHeader(user);

		const response = await request(app).get("/api/auth/me").set("Authorization", token);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.data.email).toBe("me@example.com");
	});

	it("should logout successfully", async () => {
		const user = await createTestUser({ email: "logout@example.com" });
		const token = getAuthHeader(user);

		const response = await request(app).post("/api/auth/logout").set("Authorization", token).send();

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);

		const logoutCookies = response.get("Set-Cookie");
		expect(logoutCookies?.some((c) => c.includes("refreshToken=;"))).toBe(true);
	});
});
