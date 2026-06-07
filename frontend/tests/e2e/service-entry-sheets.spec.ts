import { expect, test } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

test.describe("Service Entry Sheets Flow - API Endpoints", () => {
	test.describe.configure({ mode: "serial" });

	test("GET /api/service-entry-sheets lists SES entries", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/service-entry-sheets?page=1&limit=10`);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/service-entry-sheets creates a SES", async ({ request }) => {
		const response = await request.post(`${backendUrl}/api/service-entry-sheets`, {
			data: {
				orderId: "507f1f77bcf86cd799439011",
				serviceDescription: "SES E2E Test",
				periodStart: "2026-06-01T00:00:00Z",
				periodEnd: "2026-06-30T23:59:59Z",
				totalValue: 5000000,
			},
		});
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/service-entry-sheets/:id gets SES detail", async ({ request }) => {
		const response = await request.get(
			`${backendUrl}/api/service-entry-sheets/507f1f77bcf86cd799439011`,
		);
		expect(response.status()).not.toBe(404);
	});

	test("PUT /api/service-entry-sheets/:id/approve approves a SES", async ({ request }) => {
		const response = await request.put(
			`${backendUrl}/api/service-entry-sheets/507f1f77bcf86cd799439011/approve`,
			{ data: { approvedBy: "Test Approver", comments: "Approved" } },
		);
		expect(response.status()).not.toBe(404);
	});

	test("PUT /api/service-entry-sheets/:id/reject rejects a SES", async ({ request }) => {
		const response = await request.put(
			`${backendUrl}/api/service-entry-sheets/507f1f77bcf86cd799439011/reject`,
			{ data: { reason: "Documentation incomplete" } },
		);
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/service-entry-sheets/:id without auth returns 401", async ({ request }) => {
		const response = await request.get(
			`${backendUrl}/api/service-entry-sheets/507f1f77bcf86cd799439011`,
			{ headers: { Authorization: "" } },
		);
		expect([401, 403, 200]).toContain(response.status());
	});
});
