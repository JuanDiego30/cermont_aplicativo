import { type APIRequestContext, expect, test } from "@playwright/test";
import { E2E_ADMIN } from "./auth-credentials";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const missingId = "507f1f77bcf86cd799439099";

const workflowLists = [
	{ step: 1, name: "work requests", path: "/api/work-requests" },
	{ step: 2, name: "site visits", path: "/api/site-visits" },
	{ step: 3, name: "proposals", path: "/api/proposals" },
	{ step: 4, name: "purchase orders", path: "/api/purchase-orders" },
	{ step: 5, name: "planning packets", path: "/api/planning-packets" },
	{ step: 6, name: "execution sessions", path: "/api/execution-sessions" },
	{ step: 7, name: "evidences", path: "/api/evidences" },
	{ step: 8, name: "technical reports", path: "/api/technical-reports" },
	{ step: 9, name: "delivery records", path: "/api/delivery-records" },
	{ step: 10, name: "client signatures", path: "/api/signatures" },
	{ step: 11, name: "service entry sheets", path: "/api/service-entry-sheets" },
	{ step: 12, name: "invoice submissions", path: "/api/invoices" },
	{ step: 13, name: "invoice approvals", path: "/api/invoices" },
	{ step: 14, name: "payments", path: "/api/payments" },
] as const;

async function login(request: APIRequestContext): Promise<string> {
	const response = await request.post(`${backendUrl}/api/auth/login`, {
		data: {
			email: E2E_ADMIN.email,
			password: E2E_ADMIN.password,
		},
	});
	expect(response.status()).toBe(200);

	const payload: { data: { accessToken: string } } = await response.json();
	expect(payload.data.accessToken).toBeTruthy();
	return payload.data.accessToken;
}

function authHeaders(token: string): Record<string, string> {
	return { Authorization: `Bearer ${token}` };
}

test.describe("14-step business flow API", () => {
	let accessToken = "";

	test.beforeAll(async ({ request }) => {
		accessToken = await login(request);
	});

	for (const endpoint of workflowLists) {
		test(`Step ${endpoint.step} - ${endpoint.name} list is available`, async ({ request }) => {
			const response = await request.get(`${backendUrl}${endpoint.path}?limit=10`, {
				headers: authHeaders(accessToken),
			});

			expect(response.status()).toBe(200);
			expect(response.headers()["content-type"]).toContain("application/json");
		});
	}

	test("workflow action routes reject missing records with 404", async ({ request }) => {
		const headers = authHeaders(accessToken);
		const responses = await Promise.all([
			request.post(`${backendUrl}/api/proposals/${missingId}/po`, {
				headers,
				data: {
					poNumber: "PO-E2E-MISSING",
					serviceAccount: "SERVICE-E2E",
					billingAccount: "BILLING-E2E",
					approvedAmount: 1_000_000,
					currency: "COP",
					receivedAt: "2026-06-12T12:00:00.000Z",
				},
			}),
			request.post(`${backendUrl}/api/planning-packets/${missingId}/approve`, {
				headers,
				data: {},
			}),
			request.post(`${backendUrl}/api/delivery-records/${missingId}/sign`, {
				headers,
				data: {
					signedDocumentRef: "signed-delivery-e2e.pdf",
					signatureMethod: "digital",
					signedAt: "2026-06-12T12:00:00.000Z",
					signedBy: "E2E Client",
				},
			}),
			request.post(`${backendUrl}/api/service-entry-sheets/${missingId}/submit`, {
				headers,
				data: {},
			}),
			request.post(`${backendUrl}/api/invoices/${missingId}/approve`, { headers }),
			request.post(`${backendUrl}/api/payments/from-invoice/${missingId}`, {
				headers,
				data: {
					amount: 1_000_000,
					paidAt: "2026-06-12T12:00:00.000Z",
					paymentMethod: "bank_transfer",
					paymentReference: "PAYMENT-E2E",
					bankReference: "PAY-E2E",
				},
			}),
		]);

		expect(responses.map((response) => response.status())).toEqual([404, 404, 404, 404, 404, 404]);
	});
});

test.describe("API health contract", () => {
	test("live health endpoint returns a healthy response", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/health/live`);

		expect(response.status()).toBe(200);
		expect(await response.json()).toMatchObject({ status: "ok" });
	});

	test("metrics endpoint remains protected", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/metrics`);

		expect(response.status()).toBe(401);
	});
});
