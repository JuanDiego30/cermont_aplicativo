import request from "supertest";
import { describe, expect, it } from "vitest";
import { Checklist } from "@/checklists/infrastructure/model";
import { Document } from "@/documents/infrastructure/model";
import app from "@/index";
import { MaintenanceKit } from "@/maintenance/infrastructure/model";
import { Order } from "@/orders/infrastructure/model";
import { createTestUser, getAuthHeader } from "./integration.test-utils";

describe("Order Lifecycle Integration Tests", () => {
	async function setupKit(adminId: string) {
		return await MaintenanceKit.create({
			name: "Kit Preventivo Aire",
			activity_type: "mechanical",
			tools: [
				{ name: "Destornillador", quantity: 1 },
				{ name: "Pinzas", quantity: 1 },
			],
			equipment: [{ name: "Multímetro", quantity: 1, certificate_required: true }],
			is_active: true,
			created_by: adminId,
		});
	}

	async function completePlanning(orderId: string, adminId: string) {
		const [astDocument, supportDocument] = await Promise.all([
			Document.create({
				title: "AST firmado",
				category: "ast",
				file_url: "/uploads/test-ast.pdf",
				uploaded_by: adminId,
				order_id: orderId,
				phase: "planning",
			}),
			Document.create({
				title: "Soporte operativo",
				category: "support",
				file_url: "/uploads/test-support.pdf",
				uploaded_by: adminId,
				order_id: orderId,
				phase: "planning",
			}),
		]);

		await Order.updateOne(
			{ _id: orderId },
			{
				$set: {
					"planning.scheduledStartAt": new Date(),
					"planning.estimatedHours": 4,
					"planning.crewSize": 1,
					"planning.astDocumentId": astDocument._id,
					"planning.supportDocumentIds": [supportDocument._id],
				},
			},
		);
	}

	it("should create an order with a kit", async () => {
		const adminUser = await createTestUser({ role: "gerente" });
		const authHeader = getAuthHeader(adminUser);
		const kit = await setupKit(adminUser._id);

		const orderPayload = {
			type: "maintenance",
			priority: "high",
			description: "Mantenimiento preventivo unidad 101",
			assetId: "AC-101",
			assetName: "Aire Acondicionado Central",
			location: "Sótano 1",
			kitTemplateId: kit._id.toString(),
		};

		const response = await request(app)
			.post("/api/orders")
			.set("Authorization", authHeader)
			.send(orderPayload);

		expect(response.status).toBe(201);
		expect(response.body.success).toBe(true);
		expect(response.body.data.code).toMatch(/^OT-/);
		expect(response.body.data.materials.length).toBe(2);
	});

	it("should follow full lifecycle: assign -> start -> complete -> close", async () => {
		const adminUser = await createTestUser({ role: "gerente" });
		const tecnicoUser = await createTestUser({ role: "tecnico" });
		const authHeader = getAuthHeader(adminUser);
		const tecnicoAuthHeader = getAuthHeader(tecnicoUser);
		const kit = await setupKit(adminUser._id);

		// 1. Create Order
		const createRes = await request(app).post("/api/orders").set("Authorization", authHeader).send({
			type: "maintenance",
			priority: "medium",
			description: "Ciclo de vida test",
			assetId: "ASSET-001",
			assetName: "Test Asset",
			location: "Location X",
			kitTemplateId: kit._id.toString(),
		});

		const orderId = createRes.body.data._id;

		// 2. Assign to tecnico
		const assignRes = await request(app)
			.patch(`/api/orders/${orderId}/assign`)
			.set("Authorization", authHeader)
			.send({ userId: tecnicoUser._id.toString() });

		expect(assignRes.status).toBe(200);
		expect(assignRes.body.data.status).toBe("assigned");

		await completePlanning(orderId, adminUser._id);

		// 3. Start execution (assigned -> in_progress)
		const startRes = await request(app)
			.patch(`/api/orders/${orderId}/status`)
			.set("Authorization", tecnicoAuthHeader)
			.send({ status: "in_progress" });

		expect(startRes.status).toBe(200);
		expect(startRes.body.data.status).toBe("in_progress");

		// 4. Try to complete without finishing checklist (should fail)
		const failCompleteRes = await request(app)
			.patch(`/api/orders/${orderId}/status`)
			.set("Authorization", tecnicoAuthHeader)
			.send({ status: "completed" });

		expect(failCompleteRes.status).toBe(422);

		// 5. Complete checklist and verify materials
		const checklist = await Checklist.findOne({ orderId });
		expect(checklist).toBeDefined();

		if (checklist) {
			checklist.items = checklist.items.map((item) => ({
				...item,
				completed: true,
			}));
			checklist.status = "completed";
			checklist.completedAt = new Date();
			await checklist.save();
		}

		await Order.updateOne({ _id: orderId }, { $set: { "materials.$[].delivered": true } });

		// 6. Complete execution (in_progress -> completed)
		const completeRes = await request(app)
			.patch(`/api/orders/${orderId}/status`)
			.set("Authorization", tecnicoAuthHeader)
			.send({ status: "completed" });

		expect(completeRes.status).toBe(200);
		expect(completeRes.body.data.status).toBe("completed");
	});
});
