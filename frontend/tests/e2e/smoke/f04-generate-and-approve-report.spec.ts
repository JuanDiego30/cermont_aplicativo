import { E2E_KIT } from "../auth-credentials";
import { expect, test } from "../fixtures/base.fixture";
import { ChecklistPage } from "../pages/ChecklistPage";
import { CostPage } from "../pages/CostPage";
import { ReportPage } from "../pages/ReportPage";

test("F-04 genera, aprueba y descarga el informe de trabajo", async ({
	supervisorPage,
	apiClient,
	cleanup,
}) => {
	const supervisor = await apiClient.getUsersByRole("supervisor");
	expect(supervisor[0]?._id).toBeTruthy();

	const suffix = Date.now().toString(36);
	const order = await apiClient.createOrder({
		type: "maintenance",
		priority: "high",
		description: `Orden informe ${suffix}`,
		assetId: `RPT-${suffix.toUpperCase()}`,
		assetName: `Panel ${suffix}`,
		location: "Subestación central",
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
		observations: "Checklist completado para informe",
	});
	expect(completedChecklist.status).toBe("completed");
	await apiClient.addCost(order._id, {
		category: "materials",
		description: "Costo base para informe",
		estimatedAmount: 500000,
		actualAmount: 525000,
		taxAmount: 0,
		taxRate: 0,
		currency: "COP",
	});
	await apiClient.updateOrderStatus(order._id, "completed");

	const reportPage = new ReportPage(supervisorPage);
	const checklistPage = new ChecklistPage(supervisorPage);
	const costPage = new CostPage(supervisorPage);

	await checklistPage.openChecklistTab(order._id);
	await checklistPage.expectChecklistStatus("completed");

	await costPage.openCostsTab(order._id);
	await costPage.expectTotalCost(525000);

	await reportPage.openReportTab(order._id);
	await reportPage.generateReport();
	await reportPage.sendToReview();
	await reportPage.expectReportStatus("pending_review");
	await reportPage.approveReport();
	await reportPage.expectReportStatus("approved");
	await reportPage.expectDownloadReady();

	const download = await reportPage.downloadPDF();
	expect(await download.failure()).toBeNull();
	expect(download.suggestedFilename().toLowerCase()).toContain(".pdf");
});
