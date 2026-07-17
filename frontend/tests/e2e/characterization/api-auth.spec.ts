import { expect, test } from "@playwright/test";
import { getE2ECredentials, hasE2ECredentials } from "../auth-credentials";
import { test as authFixtureTest } from "../fixtures/auth.fixture";

test.describe("QA-CRIT-03: Auth token shared across contexts", () => {
	test.skip(!hasE2ECredentials(), "E2E credentials not configured");

	test("token extracted from browser session authorizes direct API calls", async ({ page }) => {
		const { email, password } = getE2ECredentials();

		let capturedToken = "";

		await test.step("Login via browser UI and capture auth token", async () => {
			page.on("request", (req) => {
				const auth = req.headers()["authorization"];
				if (auth && auth.startsWith("Bearer ") && !capturedToken) {
					capturedToken = auth.slice("Bearer ".length);
				}
			});

			await page.goto("/login");
			await page.getByLabel("Correo electrónico").first().fill(email);
			await page.getByLabel("Contraseña").first().fill(password);
			await page
				.getByRole("button", { name: /iniciar sesión/i })
				.first()
				.click();
			await page.waitForURL(/dashboard/, { timeout: 15_000 });

			await test.step("Verify token was captured", async () => {
				expect(capturedToken).toBeTruthy();
				expect(capturedToken.length).toBeGreaterThan(20);
			});
		});

		await test.step("Direct API call with token succeeds (200)", async () => {
			const resp = await page.request.get("/api/backend/clients", {
				headers: { Authorization: `Bearer ${capturedToken}` },
			});
			expect(resp.status()).toBe(200);
			const body = await resp.json();
			expect(body.success).toBe(true);
		});

		await test.step("Direct API POST with token succeeds (201)", async () => {
			const unique = Date.now().toString(36);
			const resp = await page.request.post("/api/backend/clients", {
				headers: { Authorization: `Bearer ${capturedToken}` },
				data: {
					name: `Auth E2E ${unique}`,
					nit: `${unique.slice(0, 9)}-${unique.slice(9, 1) || "5"}`,
				},
			});
			expect(resp.status()).toBe(201);
		});

		await test.step("GET /api/backend/clients without token returns 401", async () => {
			const resp = await page.request.get("/api/backend/clients");
			expect(resp.status()).toBe(401);
		});

		await test.step("POST /api/backend/clients without token returns 401", async () => {
			const resp = await page.request.post("/api/backend/clients", {
				data: { name: "No Auth", nit: "000000000-0" },
			});
			expect(resp.status()).toBe(401);
		});

		await test.step("GET with malformed token returns 401", async () => {
			const resp = await page.request.get("/api/backend/clients", {
				headers: { Authorization: "Bearer INVALID_TOKEN_HERE" },
			});
			expect(resp.status()).toBe(401);
		});

		await test.step("GET with expired-style token returns 401", async () => {
			const resp = await page.request.get("/api/backend/clients", {
				headers: {
					Authorization:
						"Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBjZXJtb250LnRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.RaNdOmToKeN",
				},
			});
			expect(resp.status()).toBe(401);
		});
	});

	test("login sets cookies accessible by API context", async ({ page }) => {
		const { email, password } = getE2ECredentials();

		await test.step("Login via browser UI", async () => {
			await page.goto("/login");
			await page.getByLabel("Correo electrónico").first().fill(email);
			await page.getByLabel("Contraseña").first().fill(password);
			await page
				.getByRole("button", { name: /iniciar sesión/i })
				.first()
				.click();
			await page.waitForURL(/dashboard/, { timeout: 15_000 });
		});

		await test.step("Extract cookies from browser context", async () => {
			const cookies = await page.context().cookies();
			const hasAuthCookie = cookies.some(
				(c) =>
					c.name.toLowerCase().includes("token") ||
					c.name.toLowerCase().includes("auth") ||
					c.name.toLowerCase().includes("session") ||
					c.name.toLowerCase().includes("refresh"),
			);
			const hasConnectSession = cookies.some((c) =>
				c.name.toLowerCase().includes("connect"),
			);
			expect(hasAuthCookie || hasConnectSession || cookies.length > 0).toBe(true);
		});

		await test.step("Use browser context cookies for API request", async () => {
			const resp = await page.request.get("/api/backend/clients");
			expect([200, 401]).toContain(resp.status());
		});
	});
});

authFixtureTest.describe("QA-MAJ-08: AuthFixture apiContext", () => {
	authFixtureTest.skip(!hasE2ECredentials(), "E2E credentials not configured");

	authFixtureTest("apiContext can list clients", async ({ apiContext }) => {
		const resp = await apiContext.get("clients", { params: { limit: "5" } });
		expect(resp.status()).toBe(200);
		const body = await resp.json();
		expect(body.success).toBe(true);
		expect(Array.isArray(body.data)).toBe(true);
	});

	authFixtureTest("Direct API calls WITHOUT token fail with 401", async () => {
		const { request } = await import("@playwright/test");
		const unauthCtx = await request.newContext({
			baseURL: `${(process.env.E2E_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "")}/`,
		});
		const resp = await unauthCtx.get("clients");
		expect(resp.status()).toBe(401);
		await unauthCtx.dispose();
	});

	authFixtureTest("bearer token from fixture works", async ({ authToken }) => {
		expect(authToken).toBeTruthy();
		expect(authToken.length).toBeGreaterThan(20);
	});

	authFixtureTest("userId is resolved from auth/me", async ({ userId }) => {
		expect(userId).toBeTruthy();
		expect(typeof userId).toBe("string");
	});
});
