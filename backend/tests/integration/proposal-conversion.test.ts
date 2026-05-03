import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/index";
import { Proposal } from "@/proposals/infrastructure/model";
import { createTestUser, getAuthHeader } from "./integration.test-utils";

describe("Proposal Conversion Integration Tests", () => {
	it("should convert an approved proposal to an order", async () => {
		const adminUser = await createTestUser({ role: "gerente" });
		const authHeader = getAuthHeader(adminUser);

		// 1. Create a draft proposal
		const proposal = await Proposal.create({
			code: "PROP-2026-0001",
			title: "Mantenimiento Transformadores",
			clientName: "Ecopetrol",
			status: "draft",
			items: [
				{
					description: "Aceite dieléctrico",
					unit: "L",
					quantity: 50,
					unitCost: 5000,
					total: 250000,
				},
			],
			subtotal: 250000,
			taxRate: 0.19,
			total: 297500,
			validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			createdBy: adminUser._id,
		});

		// 2. Try to convert draft (should fail)
		const failConvert = await request(app)
			.post(`/api/proposals/${proposal._id}/convert`)
			.set("Authorization", authHeader)
			.send({
				type: "maintenance",
				priority: "high",
				assetId: "TR-01",
				assetName: "Transformador Principal",
				location: "Planta A",
			});

		expect(failConvert.status).toBe(400);

		// 3. Move proposal through the current status machine: draft -> sent -> approved
		const sentRes = await request(app)
			.patch(`/api/proposals/${proposal._id}/status`)
			.set("Authorization", authHeader)
			.send({ status: "sent" });

		expect(sentRes.status).toBe(200);

		const approveRes = await request(app)
			.patch(`/api/proposals/${proposal._id}/approve`)
			.set("Authorization", authHeader)
			.send({ poNumber: "PO-12345" });

		expect(approveRes.status).toBe(200);

		// 4. Convert approved proposal
		const convertRes = await request(app)
			.post(`/api/proposals/${proposal._id}/convert`)
			.set("Authorization", authHeader)
			.send({
				type: "maintenance",
				priority: "high",
				assetId: "TR-01",
				assetName: "Transformador Principal",
				location: "Planta A",
			});

		expect(convertRes.status).toBe(201);
		expect(convertRes.body.data.order.code).toMatch(/^OT-/);
		expect(convertRes.body.data.order.materials.length).toBe(1);
		expect(convertRes.body.data.order.materials[0].name).toBe("Aceite dieléctrico");

		// 5. Verify proposal is updated with order reference
		const updatedProposal = await Proposal.findById(proposal._id);
		expect(updatedProposal?.generatedOrders?.length).toBe(1);
		expect(updatedProposal?.generatedOrders?.[0].toString()).toBe(convertRes.body.data.order._id);
	});
});
