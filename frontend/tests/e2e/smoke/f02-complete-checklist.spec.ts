import { E2E_KIT } from "../auth-credentials";
import { expect, test } from "../fixtures/base.fixture";
import { ChecklistPage } from "../pages/ChecklistPage";
import { OrdersPage } from "../pages/OrdersPage";

test("F-02 completa el checklist y mantiene la orden en progreso", async ({
	technicianPage,
	apiClient,
	cleanup,
}) => {
	const technician = await apiClient.getUsersByRole("tecnico");
	const technicianId = technician[0]?._id;

	expect(technicianId).toBeTruthy();

	const suffix = Date.now().toString(36);
	const order = await apiClient.createOrder({
		type: "maintenance",
		priority: "high",
		description: `Orden checklist ${suffix}`,
		assetId: `CHK-${suffix.toUpperCase()}`,
		assetName: `Motor de prueba ${suffix}`,
		location: "Taller 1",
		kitTemplate: E2E_KIT.name,
		materials: [],
	});

	cleanup.trackOrder(order._id);

	await apiClient.assignOrder(order._id, technicianId as string);
	await apiClient.updateOrderStatus(order._id, "in_progress");

	const checklistPage = new ChecklistPage(technicianPage);
	const ordersPage = new OrdersPage(technicianPage);

	await checklistPage.openChecklistTab(order._id);
	await checklistPage.expectChecklistStatus("pending");
	await checklistPage.expectItemsLoaded(2);
	const checklist = await apiClient.getChecklistByOrderId(order._id);
	expect(checklist).toBeTruthy();

	for (const item of checklist?.items ?? []) {
		if (!item.completed && item.required) {
			const updatedChecklist = await apiClient.updateChecklistItem(
				checklist?._id ?? "",
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

	const refreshedChecklist = await apiClient.getChecklistByOrderId(order._id);
	const requiredCompleted =
		refreshedChecklist?.items.filter((item) => item.required && item.completed).length ?? 0;
	const requiredTotal = refreshedChecklist?.items.filter((item) => item.required).length ?? 0;
	const pendingRequiredIds =
		refreshedChecklist?.items
			.filter((item) => item.required && !item.completed)
			.map((item) => item.id) ?? [];
	expect(pendingRequiredIds, JSON.stringify(refreshedChecklist?.items)).toHaveLength(0);
	expect(requiredCompleted).toBe(requiredTotal);

	const completedChecklist = await apiClient.completeChecklist(order._id, {
		observations: "Checklist completado por E2E",
	});
	expect(completedChecklist.status).toBe("completed");
	await checklistPage.openChecklistTab(order._id);
	await checklistPage.expectChecklistStatus("completed");

	await ordersPage.expectOrderStatus(order._id, "in_progress");
});
