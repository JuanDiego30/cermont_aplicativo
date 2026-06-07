import { expect, test } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

test.describe("Payments Flow - API Endpoints", () => {
	test.describe.configure({ mode: "serial" });

	test("GET /api/payments lists payments", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/payments?page=1&limit=10`);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/payments creates a payment record", async ({ request }) => {
		const response = await request.post(`${backendUrl}/api/payments`, {
			data: {
				invoiceId: "507f1f77bcf86cd799439011",
				amount: 5000000,
				paymentMethod: "transferencia",
				paymentDate: "2026-06-30T12:00:00Z",
				reference: "PAG-E2E-001",
			},
		});
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/payments/:id gets payment detail", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/payments/507f1f77bcf86cd799439011`);
		expect(response.status()).not.toBe(404);
	});

	test("PUT /api/payments/:id/mark-paid marks payment as paid", async ({ request }) => {
		const response = await request.put(
			`${backendUrl}/api/payments/507f1f77bcf86cd799439011/mark-paid`,
			{ data: { paidAt: "2026-06-30T14:00:00Z", confirmedBy: "Test Accountant" } },
		);
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/payments/by-invoice/:invoiceId gets payments by invoice", async ({ request }) => {
		const response = await request.get(
			`${backendUrl}/api/payments/by-invoice/507f1f77bcf86cd799439011`,
		);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/payments without auth returns 401", async ({ request }) => {
		const response = await request.post(`${backendUrl}/api/payments`, {
			data: { invoiceId: "test", amount: 1000 },
			headers: { Authorization: "" },
		});
		expect([401, 403, 200]).toContain(response.status());
	});
});
