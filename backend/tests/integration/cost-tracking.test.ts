import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/index";
import { Order } from "@/orders/infrastructure/model";
import { createTestUser, getAuthHeader } from "./integration.test-utils";

describe("Cost Tracking Integration Tests", () => {
	async function setupOrder(adminId: string) {
		return await Order.create({
			code: "OT-202604-0001",
			type: "maintenance",
			priority: "medium",
			description: "Cost tracking test order",
			assetId: "ASSET-999",
			assetName: "Generic Machine",
			location: "Workshop",
			status: "in_progress",
			createdBy: adminId,
		});
	}

	it("should record costs and calculate variance", async () => {
		const adminUser = await createTestUser({ role: "gerente" });
		const authHeader = getAuthHeader(adminUser);
		const order = await setupOrder(adminUser._id);
		const orderId = order._id.toString();

		// 1. Create a labor cost
		const laborCost = {
			orderId,
			category: "labor",
			description: "Técnico especializado 4h",
			estimatedAmount: 200000,
			actualAmount: 250000,
			taxAmount: 0,
			currency: "COP",
		};

		const res1 = await request(app)
			.post("/api/costs")
			.set("Authorization", authHeader)
			.send(laborCost);

		expect(res1.status).toBe(201);
		expect(res1.body.data.variance).toBe(50000);

		// 2. Create a material cost (savings)
		const materialCost = {
			orderId,
			category: "materials",
			description: "Filtros de aire",
			estimatedAmount: 150000,
			actualAmount: 120000,
			taxAmount: 22800, // 19% of 120000
			currency: "COP",
		};

		const res2 = await request(app)
			.post("/api/costs")
			.set("Authorization", authHeader)
			.send(materialCost);

		expect(res2.status).toBe(201);
		expect(res2.body.data.variance).toBe(-30000);

		// 3. Get order summary
		const summaryRes = await request(app)
			.get(`/api/costs/order/${orderId}/summary`)
			.set("Authorization", authHeader);

		expect(summaryRes.status).toBe(200);
		expect(summaryRes.body.data.totalEstimated).toBe(350000);
		expect(summaryRes.body.data.totalActual).toBe(370000);
		expect(summaryRes.body.data.totalTax).toBe(22800);
		expect(summaryRes.body.data.variance).toBe(42800);
	});

	it.skip("should return cross-order dashboard metrics", async () => {
		const adminUser = await createTestUser({ role: "gerente" });
		const authHeader = getAuthHeader(adminUser);
		await setupOrder(adminUser._id);

		const dashboardRes = await request(app)
			.get("/api/costs/dashboard")
			.set("Authorization", authHeader);

		expect(dashboardRes.status).toBe(200);
		expect(dashboardRes.body.data.totalActual).toBeGreaterThan(0);
		expect(dashboardRes.body.data.byCategory.length).toBeGreaterThan(0);
	});
});
