import { E2E_KIT } from "../auth-credentials";
import { expect, test } from "../fixtures/base.fixture";
import { ChecklistPage } from "../pages/ChecklistPage";
import { CostPage } from "../pages/CostPage";

test("F-03 registra costos y muestra total y variancia", async ({
	technicianPage,
	apiClient,
	cleanup,
}) => {
	const technician = await apiClient.getUsersByRole("tecnico");
	const technicianId = technician[0]?._id ?? "";

	expect(technicianId).toBeTruthy();

	const suffix = Date.now().toString(36);
	const order = await apiClient.createOrder({
		type: "maintenance",
		priority: "medium",
		description: `Orden costos ${suffix}`,
		assetId: `CST-${suffix.toUpperCase()}`,
		assetName: `Compresor ${suffix}`,
		location: "Planta Oeste",
		kitTemplate: E2E_KIT.name,
		materials: [],
	});

	cleanup.trackOrder(order._id);

	await apiClient.assignOrder(order._id, technicianId as string);
	await apiClient.updateOrderStatus(order._id, "in_progress");

	const checklist = await apiClient.getChecklistByOrderId(order._id);
	const checklistId = checklist?._id ?? "";

	expect(checklistId).toBeTruthy();

	for (const item of checklist?.items ?? []) {
		if (!item.completed && item.required) {
			const updatedChecklist = await apiClient.updateChecklistItem(
				checklistId,
				item.id,
				true,
				item.observation,
			);
			const updatedItem = updatedChecklist.items.find(
				(checklistItem) => checklistItem.id === item.id,
			);
			expect(updatedItem?.completed).toBe(true);
		}
	}

	const completedChecklist = await apiClient.completeChecklist(order._id, {
		observations: "Checklist listo para costos",
	});
	expect(completedChecklist.status).toBe("completed");

	const costPage = new CostPage(technicianPage);
	const checklistPage = new ChecklistPage(technicianPage);

	await checklistPage.openChecklistTab(order._id);
	await checklistPage.expectChecklistStatus("completed");

	await costPage.openCostsTab(order._id);
	await apiClient.addCost(order._id, {
		description: "Servicio y materiales de prueba",
		category: "materials",
		estimatedAmount: 500000,
		actualAmount: 525000,
		taxAmount: 0,
		taxRate: 0,
		currency: "COP",
	});

	await costPage.openCostsTab(order._id);
	await costPage.expectTotalCost(525000);
	await costPage.expectVariance(25000);
});
