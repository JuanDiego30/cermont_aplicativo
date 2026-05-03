import request from "supertest";
import { describe, expect, it } from "vitest";
import { Checklist } from "@/checklists/infrastructure/model";
import app from "@/index";
import { Order } from "@/orders/infrastructure/model";
import { createTestUser, getAuthHeader } from "./integration.test-utils";

describe("Checklist Gate Integration Tests", () => {
	async function setupOrderAndChecklist(tecnicoId: string) {
		const order = await Order.create({
			code: "OT-202604-0002",
			type: "maintenance",
			priority: "medium",
			description: "Checklist gate test",
			assetId: "ASSET-CHK",
			assetName: "Test Machine",
			location: "Test Area",
			status: "in_progress",
			assignedTo: tecnicoId,
			materials: [{ name: "Part A", quantity: 1, unit: "und", delivered: false }],
			createdBy: tecnicoId,
		});

		const checklist = await Checklist.create({
			orderId: order._id,
			templateName: "Estándar",
			status: "pending",
			items: [
				{ id: "1", category: "ppe", description: "Use boots", required: true, completed: false },
			],
		});

		return { orderId: order._id.toString(), checklistId: checklist._id.toString() };
	}

	it("should block transition to completed if checklist is pending", async () => {
		const tecnicoUser = await createTestUser({ role: "tecnico" });
		const authHeader = getAuthHeader(tecnicoUser);
		const { orderId } = await setupOrderAndChecklist(tecnicoUser._id);

		const response = await request(app)
			.patch(`/api/orders/${orderId}/status`)
			.set("Authorization", authHeader)
			.send({ status: "completed" });

		expect(response.status).toBe(422);
		expect(response.body.error.message).toContain("Mandatory checklist is pending completion");
	});

	it("should block transition to completed if materials are not verified", async () => {
		const tecnicoUser = await createTestUser({ role: "tecnico" });
		const authHeader = getAuthHeader(tecnicoUser);
		const { orderId } = await setupOrderAndChecklist(tecnicoUser._id);

		// 1. Complete checklist
		await Checklist.updateOne(
			{ orderId },
			{ $set: { status: "completed", "items.0.completed": true } },
		);

		// 2. Try to complete order
		const response = await request(app)
			.patch(`/api/orders/${orderId}/status`)
			.set("Authorization", authHeader)
			.send({ status: "completed" });

		expect(response.status).toBe(422);
		expect(response.body.error.message).toContain("materials are still pending delivery");
	});

	it("should allow transition to completed when all gates are passed", async () => {
		const tecnicoUser = await createTestUser({ role: "tecnico" });
		const authHeader = getAuthHeader(tecnicoUser);
		const { orderId } = await setupOrderAndChecklist(tecnicoUser._id);

		// 1. Complete checklist
		await Checklist.updateOne(
			{ orderId },
			{ $set: { status: "completed", "items.0.completed": true } },
		);

		// 2. Verify materials
		await Order.updateOne({ _id: orderId }, { $set: { "materials.0.delivered": true } });

		// 3. Complete order
		const response = await request(app)
			.patch(`/api/orders/${orderId}/status`)
			.set("Authorization", authHeader)
			.send({ status: "completed" });

		expect(response.status).toBe(200);
		expect(response.body.data.status).toBe("completed");
	});
});
