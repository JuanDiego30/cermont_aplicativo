import { E2E_KIT } from "../auth-credentials";
import { expect, test } from "../fixtures/base.fixture";
import { ChecklistPage } from "../pages/ChecklistPage";
import { OrdersPage } from "../pages/OrdersPage";

test("F-01 crea una OT y carga el checklist desde la plantilla", async ({ adminPage }) => {
	const ordersPage = new OrdersPage(adminPage);
	const checklistPage = new ChecklistPage(adminPage);
	const suffix = Date.now().toString(36);
	const assetName = `Activo E2E ${suffix}`;
	const assetId = `AST-${suffix.toUpperCase()}`;

	await ordersPage.goto();
	await ordersPage.clickNewOrder();

	await ordersPage.fillOrderForm({
		type: "maintenance",
		priority: "medium",
		description: `Orden E2E ${suffix}`,
		assetId,
		assetName,
		location: "Planta Norte",
		kitTemplate: E2E_KIT.name,
	});

	const responsePromise = adminPage.waitForResponse(
		(response) =>
			response.request().method() === "POST" && response.url().includes("/api/backend/orders"),
	);
	await ordersPage.submitOrder();
	const response = await responsePromise;
	expect(response.ok()).toBeTruthy();
	const body = (await response.json()) as { data?: { _id?: string } };
	const orderId = body.data?._id;

	expect(orderId).toBeTruthy();
	await expect(adminPage).toHaveURL(/\/orders$/);
	await ordersPage.expectOrderVisible(assetName);

	await ordersPage.openOrderById(orderId as string);
	await checklistPage.openChecklistTab(orderId as string);
	await checklistPage.expectChecklistStatus("pending");
	await checklistPage.expectItemsLoaded(2);
	await expect(adminPage.getByText(E2E_KIT.tools[0].name, { exact: false })).toBeVisible();
	await expect(adminPage.getByText(E2E_KIT.equipment[0].name, { exact: false })).toBeVisible();
});
