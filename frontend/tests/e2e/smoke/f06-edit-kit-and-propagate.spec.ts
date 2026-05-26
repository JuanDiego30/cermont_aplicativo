import { expect, test } from "../fixtures/base.fixture";
import { ChecklistPage } from "../pages/ChecklistPage";
import { MaintenanceCatalogPage } from "../pages/MaintenanceCatalogPage";
import { OrdersPage } from "../pages/OrdersPage";

test("F-06 edita un kit típico y el nuevo pedido hereda el cambio", async ({
	adminPage,
	apiClient,
	cleanup,
}) => {
	const suffix = Date.now().toString(36);
	const kit = await apiClient.createKit({
		name: `Kit E2E ${suffix}`,
		activityType: "electrico",
		tools: [
			{ name: "Alicate aislado", quantity: 1, specifications: "1000V" },
			{ name: "Destornillador aislado", quantity: 1, specifications: "Plano" },
		],
		equipment: [],
	});

	cleanup.trackKit(kit._id);

	const updatedKit = await apiClient.updateKit(kit._id, {
		tools: [
			...kit.tools,
			{
				name: "Llave ajustable",
				quantity: 1,
				specifications: "18 pulgadas",
			},
		],
	});

	expect(updatedKit.tools).toHaveLength(3);

	const catalogPage = new MaintenanceCatalogPage(adminPage);

	await catalogPage.goto();
	await catalogPage.expectKitVisible(kit.name);

	const suffixOrder = `${suffix}x`;
	const order = await apiClient.createOrder({
		type: "maintenance",
		priority: "medium",
		description: `Orden con kit editado ${suffixOrder}`,
		assetId: `KIT-${suffixOrder.toUpperCase()}`,
		assetName: `Motor de respaldo ${suffixOrder}`,
		location: "Área de pruebas",
		kitTemplate: kit.name,
		materials: [],
	});

	cleanup.trackOrder(order._id);

	const ordersPage = new OrdersPage(adminPage);
	const checklistPage = new ChecklistPage(adminPage);

	const checklist = await apiClient.getChecklistByOrderId(order._id);
	expect(checklist).not.toBeNull();
	expect(checklist?.items).toHaveLength(6);
	expect(checklist?.items.some((item) => item.description.includes("Llave ajustable"))).toBe(true);
	expect(checklist?.items.some((item) => item.description.includes("Alicate aislado"))).toBe(true);
	expect(checklist?.items.some((item) => item.description.includes("Destornillador aislado"))).toBe(
		true,
	);

	await checklistPage.openChecklistTab(order._id);

	await ordersPage.openOrderById(order._id);
	await expect(adminPage.locator("header").getByTestId("order-status-badge")).toContainText(
		"Abierta",
	);
});
