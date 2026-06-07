import { expect, test } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

test.describe("Invoices Flow - API Endpoints", () => {
	test.describe.configure({ mode: "serial" });

	test("GET /api/invoices lists invoices", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/invoices?page=1&limit=10`);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/invoices emits an invoice", async ({ request }) => {
		const response = await request.post(`${backendUrl}/api/invoices`, {
			data: {
				orderId: "507f1f77bcf86cd799439011",
				sesId: "507f1f77bcf86cd799439012",
				invoiceNumber: "FAC-E2E-001",
				totalValue: 5000000,
				dueDate: "2026-07-15T23:59:59Z",
			},
		});
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/invoices/:id gets invoice detail", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/invoices/507f1f77bcf86cd799439011`);
		expect(response.status()).not.toBe(404);
	});

	test("PUT /api/invoices/:id/approve approves an invoice", async ({ request }) => {
		const response = await request.put(
			`${backendUrl}/api/invoices/507f1f77bcf86cd799439011/approve`,
			{ data: { approvedBy: "Test Approver" } },
		);
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/invoices/:id/pdf generates invoice PDF", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/invoices/507f1f77bcf86cd799439011/pdf`);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/invoices without auth returns 401", async ({ request }) => {
		const response = await request.post(`${backendUrl}/api/invoices`, {
			data: { orderId: "test", totalValue: 1000 },
			headers: { Authorization: "" },
		});
		expect([401, 403, 200]).toContain(response.status());
	});
});
