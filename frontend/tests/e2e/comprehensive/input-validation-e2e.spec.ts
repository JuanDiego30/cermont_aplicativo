/**
 * Exhaustive Input Validation E2E Test Suite
 *
 * Tests all API input validation scenarios:
 * - ObjectId format validation
 * - Email/password validation
 * - Role/enum validation
 * - Query parameter validation
 * - HTTP method validation
 * - Header validation
 * - Body content validation
 * - Numeric boundary validation
 * - Date validation
 * - XSS / injection attempt validation
 *
 * Run: npm run test:e2e -w frontend -- tests/e2e/comprehensive/input-validation-e2e.spec.ts
 */

import { expect, request as playwrightRequest, test } from "@playwright/test";
import { E2E_ADMIN } from "../auth-credentials";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAdminToken(): Promise<string> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.post("/api/backend/auth/login", {
			data: { email: E2E_ADMIN.email, password: E2E_ADMIN.password },
		});
		const json = (await resp.json()) as { data?: { accessToken?: string } };
		return json.data?.accessToken ?? "";
	} finally {
		await context.dispose();
	}
}

function headers(token: string) {
	return { Authorization: `Bearer ${token}` };
}

async function get(token: string, path: string): Promise<number> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.get(`/api/backend${path}`, { headers: headers(token) });
		return resp.status();
	} finally {
		await context.dispose();
	}
}

async function post(
	token: string,
	path: string,
	reqBody: object,
): Promise<{ status: number; bodyText: string }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.post(`/api/backend${path}`, {
			data: reqBody,
			headers: headers(token),
		});
		return { status: resp.status(), bodyText: await resp.text() };
	} finally {
		await context.dispose();
	}
}

async function put(
	token: string,
	path: string,
	reqBody: object,
): Promise<{ status: number; bodyText: string }> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.put(`/api/backend${path}`, {
			data: reqBody,
			headers: headers(token),
		});
		return { status: resp.status(), bodyText: await resp.text() };
	} finally {
		await context.dispose();
	}
}

async function del(token: string, path: string): Promise<number> {
	const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
	try {
		const resp = await context.delete(`/api/backend${path}`, { headers: headers(token) });
		return resp.status();
	} finally {
		await context.dispose();
	}
}

let token: string;

test.beforeAll(async () => {
	token = await getAdminToken();
	expect(token).toBeTruthy();
});

// ─── 1. ObjectId Validation ───────────────────────────────────────────────────

test.describe("Input Validation — ObjectId", () => {
	test("valid 24-char hex ID on non-existent user returns 404 (not 500)", async () => {
		const status = await get(token, "/users/aaaaaaaaaaaaaaaaaaaaaaa1");
		expect(status).toBe(404);
	});

	test("23-char hex ID returns 400", async () => {
		const status = await get(token, "/users/aaaaaaaaaaaaaaaaaaaaaaa");
		expect(status).toBe(400);
	});

	test("25-char hex ID returns 400", async () => {
		const status = await get(token, "/users/aaaaaaaaaaaaaaaaaaaaaaaa1");
		expect(status).toBe(400);
	});

	test("invalid characters (lowercase hex boundary) returns 400", async () => {
		const status = await get(token, "/users/zzzzzzzzzzzzzzzzzzzzzzzz");
		expect(status).toBe(400);
	});

	test("empty ID segment returns 400 or 404", async () => {
		const status = await get(token, "/users/");
		// The route might not match, but should not 500
		expect([400, 404]).toContain(status);
	});

	test("SQL injection in ID returns 400", async () => {
		const status = await get(token, "/users/1' OR '1'='1");
		expect(status).toBe(400);
	});

	test("NoSQL injection in ID returns 400", async () => {
		const status = await get(token, "/users/%7B%24ne%3A%22%22%7D");
		expect(status).toBe(400);
	});

	test("path traversal in ID returns 400", async () => {
		const status = await get(token, "/users/..%2F..%2F..%2Fetc%2Fpasswd");
		expect(status).toBe(400);
	});

	test("XSS script in ID returns 400", async () => {
		const status = await get(token, "/users/%3Cscript%3Ealert(1)%3C/script%3E");
		expect(status).toBe(400);
	});

	test("extremely long ID (1000 chars) returns 400", async () => {
		const longId = "a".repeat(1000);
		const status = await get(token, `/users/${longId}`);
		expect(status).toBe(400);
	});

	test("UUID-format ID returns 400", async () => {
		const status = await get(token, "/users/550e8400-e29b-41d4-a716-446655440000");
		expect(status).toBe(400);
	});
});

// ─── 2. Email Validation ──────────────────────────────────────────────────────

test.describe("Input Validation — Email", () => {
	test("missing @ symbol returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Email Test",
			email: "notanemail",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("missing domain returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Email Test",
			email: "user@",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("multiple @ symbols returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Email Test",
			email: "user@domain@test.com",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("empty email returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Email Test",
			email: "",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("spaces in email returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Email Test",
			email: "user @test.com",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("XSS in email returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Email Test",
			email: "<script>alert(1)</script>@test.com",
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});
});

// ─── 3. Password Validation ───────────────────────────────────────────────────

test.describe("Input Validation — Password", () => {
	test("too short password (3 chars) returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Password Test",
			email: `pw-short-${Date.now()}@test.com`,
			password: "Ab1",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("no uppercase password returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Password Test",
			email: `pw-noupper-${Date.now()}@test.com`,
			password: "lowercase123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("no lowercase password returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Password Test",
			email: `pw-nolower-${Date.now()}@test.com`,
			password: "UPPERCASE123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("no number password returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Password Test",
			email: `pw-nonum-${Date.now()}@test.com`,
			password: "NoNumbersHere!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("empty password returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Password Test",
			email: `pw-empty-${Date.now()}@test.com`,
			password: "",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("whitespace-only password returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Password Test",
			email: `pw-space-${Date.now()}@test.com`,
			password: "        ",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});
});

// ─── 4. Role / Enum Validation ────────────────────────────────────────────────

test.describe("Input Validation — Role / Enum", () => {
	const VALID_ROLES = [
		"gerente",
		"residente",
		"HES",
		"supervisor",
		"operador",
		"tecnico",
		"administrativo",
		"cliente",
	];

	for (const role of VALID_ROLES) {
		test(`valid role "${role}" is accepted`, async () => {
			const { status } = await post(token, "/users", {
				name: `Role Test ${role}`,
				email: `role-${role}-${Date.now()}@test.com`,
				password: "TestPass123!",
				role,
			});
			expect(status).toBe(201);
		});
	}

	test("invalid role 'admin' returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Role Test",
			email: `role-admin-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "admin",
		});
		expect(status).toBe(400);
	});

	test("invalid role 'super_admin' returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Role Test",
			email: `role-superadmin-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "super_admin",
		});
		expect(status).toBe(400);
	});

	test("empty role returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "Role Test",
			email: `role-empty-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "",
		});
		expect(status).toBe(400);
	});
});

// ─── 5. Query Parameter Validation ────────────────────────────────────────────

test.describe("Input Validation — Query Parameters", () => {
	test("negative page number returns 400", async () => {
		const status = await get(token, "/users?page=-1");
		expect(status).toBe(400);
	});

	test("zero page number returns 400", async () => {
		const status = await get(token, "/users?page=0");
		expect(status).toBe(400);
	});

	test("string as page number returns 400", async () => {
		const status = await get(token, "/users?page=abc");
		expect(status).toBe(400);
	});

	test("negative limit returns 400", async () => {
		const status = await get(token, "/users?limit=-5");
		expect(status).toBe(400);
	});

	test("excessive limit returns 400", async () => {
		const status = await get(token, "/users?limit=99999");
		expect(status).toBe(400);
	});

	test("invalid boolean for isActive returns 400", async () => {
		const status = await get(token, "/users?isActive=notaboolean");
		expect(status).toBe(400);
	});
});

// ─── 6. HTTP Method Validation ────────────────────────────────────────────────

test.describe("Input Validation — HTTP Methods", () => {
	test("DELETE on user list returns 405 or 404", async () => {
		const status = await del(token, "/users");
		expect([404, 405, 400]).toContain(status);
	});

	test("PUT on user list returns 405 or 404", async () => {
		const { status } = await put(token, "/users", {});
		expect([404, 405, 400]).toContain(status);
	});
});

// ─── 7. Header / Auth Validation ──────────────────────────────────────────────

test.describe("Input Validation — Auth Headers", () => {
	test("request without Authorization header returns 401", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/users");
			expect(resp.status()).toBe(401);
		} finally {
			await context.dispose();
		}
	});

	test("request with malformed token returns 401", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/users", {
				headers: { Authorization: "Bearer not-a-valid-jwt-token" },
			});
			expect(resp.status()).toBe(401);
		} finally {
			await context.dispose();
		}
	});

	test("request with empty token returns 401", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.get("/api/backend/users", {
				headers: { Authorization: "Bearer " },
			});
			expect(resp.status()).toBe(401);
		} finally {
			await context.dispose();
		}
	});
});

// ─── 8. Body / Content Validation ─────────────────────────────────────────────

test.describe("Input Validation — Request Body", () => {
	test("POST with empty JSON body returns 400", async () => {
		const { status } = await post(token, "/users", {});
		expect(status).toBe(400);
	});

	test("POST with extra unknown fields returns 400 (Zod strict mode)", async () => {
		const { status } = await post(token, "/users", {
			name: "Strict Test",
			email: `strict-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "tecnico",
			unexpectedField: "should be rejected",
			anotherExtra: 123,
		});
		expect(status).toBe(400);
	});

	test("POST with empty object body returns 400", async () => {
		const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
		try {
			const resp = await context.post("/api/backend/users", {
				data: {},
				headers: { Authorization: `Bearer ${token}` },
			});
			expect(resp.status()).toBe(400);
		} finally {
			await context.dispose();
		}
	});

	test("POST with array instead of object returns 400", async () => {
		const { status } = await post(token, "/users", [1, 2, 3]);
		expect(status).toBe(400);
	});
});

// ─── 9. Numeric / Boundary Validation ─────────────────────────────────────────

test.describe("Input Validation — Numeric Boundaries", () => {
	test("POST /orders with invalid order type returns 400", async () => {
		const { status } = await post(token, "/orders", {
			assetId: "test-asset",
			assetName: "Test Asset",
			location: "Test Location",
			description: "Test",
			type: "invalid_type_xyz",
			priority: "invalid_priority",
		});
		expect(status).toBe(400);
	});

	test("POST /orders with missing required fields returns 400", async () => {
		const { status } = await post(token, "/orders", {
			// missing assetId, assetName, description — all required
			type: "correctivo",
		});
		expect(status).toBe(400);
	});
});

// ─── 10. Name / Text Field Validation ─────────────────────────────────────────

test.describe("Input Validation — Text Fields", () => {
	test("empty name returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "",
			email: `name-empty-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("XSS in name returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "<script>alert('XSS')</script>",
			email: `xss-name-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("whitespace-only name returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "   ",
			email: `whitespace-name-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});

	test("extremely long name (2000+ chars) returns 400", async () => {
		const { status } = await post(token, "/users", {
			name: "a".repeat(2000),
			email: `long-name-${Date.now()}@test.com`,
			password: "TestPass123!",
			role: "tecnico",
		});
		expect(status).toBe(400);
	});
});
