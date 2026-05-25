import { E2E_KIT } from "../auth-credentials";
import type { E2EApiClient } from "../fixtures/api-client.fixture";
import { expect, test } from "../fixtures/base.fixture";
import { ReportPage } from "../pages/ReportPage";

async function buildCompletedOrder(
	apiClient: E2EApiClient,
	cleanup: { trackOrder: (orderId: string) => void },
	suffix: string,
) {
	const order = await apiClient.createOrder({
		type: "maintenance",
		priority: "high",
		description: `Orden gate ${suffix}`,
		assetId: `GAT-${suffix.toUpperCase()}`,
		assetName: `Bomba ${suffix}`,
		location: "Patio de mantenimiento",
		kitTemplate: E2E_KIT.name,
		materials: [],
	});

	cleanup.trackOrder(order._id);

	const technician = await apiClient.getUsersByRole("tecnico");
	await apiClient.assignOrder(order._id, technician[0]?._id ?? "");
	await apiClient.updateOrderStatus(order._id, "in_progress");

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

	const completedChecklist = await apiClient.completeChecklist(order._id, {
		observations: "Checklist cerrado",
	});
	expect(completedChecklist.status).toBe("completed");

	await apiClient.updateOrderStatus(order._id, "completed");
	return order;
}

test("F-05 bloquea la orden lista para facturar sin costos ni informe aprobado y la habilita cuando todo está completo", async ({
	adminPage,
	apiClient,
	cleanup,
}) => {
	const orderA = await buildCompletedOrder(apiClient, cleanup, `${Date.now().toString(36)}a`);
	const reportPageA = new ReportPage(adminPage);

	await reportPageA.openReportTab(orderA._id);
	await expect(adminPage.getByTestId("invoicing-gate-error")).toContainText(
		"Faltan costos registrados",
	);

	await expect(apiClient.updateOrderStatus(orderA._id, "ready_for_invoicing")).rejects.toThrow();

	const orderB = await buildCompletedOrder(apiClient, cleanup, `${Date.now().toString(36)}b`);
	await apiClient.addCost(orderB._id, {
		category: "materials",
		description: "Costo listo para facturación",
		estimatedAmount: 500000,
		actualAmount: 525000,
		taxAmount: 0,
		taxRate: 0,
		currency: "COP",
	});

	const reportPageB = new ReportPage(adminPage);
	await reportPageB.openReportTab(orderB._id);
	await expect(adminPage.getByTestId("invoicing-gate-error")).toContainText(
		"Falta aprobar el informe",
	);
	await expect(apiClient.updateOrderStatus(orderB._id, "ready_for_invoicing")).rejects.toThrow();

	const orderC = await buildCompletedOrder(apiClient, cleanup, `${Date.now().toString(36)}c`);
	await apiClient.addCost(orderC._id, {
		category: "materials",
		description: "Costo completo para facturación",
		estimatedAmount: 500000,
		actualAmount: 525000,
		taxAmount: 0,
		taxRate: 0,
		currency: "COP",
	});

	const orderDetailPage = new ReportPage(adminPage);
	await orderDetailPage.openReportTab(orderC._id);
	await orderDetailPage.generateReport();
	await orderDetailPage.sendToReview();
	await orderDetailPage.approveReport();

	await orderDetailPage.openReportTab(orderC._id);
	await adminPage.getByRole("button", { name: /marcar como listo para facturar/i }).click();
	await expect(adminPage.getByTestId("order-status-badge")).toContainText("Lista para facturación");
});
