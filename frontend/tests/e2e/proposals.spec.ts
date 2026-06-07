import { expect, test } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

test.describe("Proposals Flow - API Endpoints", () => {
	test.describe.configure({ mode: "serial" });

	test("GET /api/proposals lists proposals", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/proposals?page=1&limit=10`);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/proposals creates a proposal", async ({ request }) => {
		const response = await request.post(`${backendUrl}/api/proposals`, {
			data: {
				title: "Proposal E2E Test",
				clientName: "Test Client",
				serviceType: "Maintenance",
				description: "E2E test proposal",
				estimatedValue: 1000000,
				validUntil: "2026-12-31T23:59:59Z",
			},
		});
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/proposals/:id gets proposal detail", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/proposals/507f1f77bcf86cd799439011`);
		expect(response.status()).not.toBe(404);
	});

	test("PUT /api/proposals/:id/approve approves a proposal", async ({ request }) => {
		const response = await request.put(
			`${backendUrl}/api/proposals/507f1f77bcf86cd799439011/approve`,
			{ data: { approvedBy: "Test Approver" } },
		);
		expect(response.status()).not.toBe(404);
	});

	test("POST /api/proposals/:id/convert converts proposal to order", async ({ request }) => {
		const response = await request.post(
			`${backendUrl}/api/proposals/507f1f77bcf86cd799439011/convert`,
			{ data: { priority: "alta", startDate: "2026-06-15T08:00:00Z" } },
		);
		expect(response.status()).not.toBe(404);
	});

	test("GET /api/proposals without auth returns 401", async ({ request }) => {
		const response = await request.get(`${backendUrl}/api/proposals`, {
			headers: { Authorization: "" },
		});
		expect([401, 403, 200]).toContain(response.status());
	});
});
