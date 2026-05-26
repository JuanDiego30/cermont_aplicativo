import type { OrderPriority, OrderStatus, OrderType } from "@cermont/shared-types";
import { expect, type Locator, type Page } from "@playwright/test";

export interface CreateOrderFormData {
	type: OrderType;
	priority: OrderPriority;
	description: string;
	assetId: string;
	assetName: string;
	location: string;
	kitTemplate?: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
	open: "Abierta",
	proposal_sent: "Propuesta enviada",
	proposal_approved: "Propuesta aprobada",
	planning: "En planeación",
	assigned: "Asignada",
	ready_for_execution: "Lista para ejecución",
	execution_in_progress: "Ejecución en campo",
	execution_completed: "Ejecución completada",
	in_progress: "En Progreso",
	on_hold: "En Pausa",
	report_pending: "Informe pendiente",
	completed: "Completada",
	ready_for_invoicing: "Lista para facturación",
	acta_signed: "Acta firmada",
	ses_sent: "SES enviada",
	invoice_approved: "Factura aprobada",
	paid: "Pagada",
	closed: "Cerrada",
	cancelled: "Cancelada",
};

export class OrdersPage {
	constructor(private readonly page: Page) {}

	async goto(): Promise<void> {
		await this.page.goto("/orders", { waitUntil: "domcontentloaded" });
	}

	async clickNewOrder(): Promise<void> {
		await this.page.goto("/orders/new", { waitUntil: "domcontentloaded" });
	}

	async fillOrderForm(data: CreateOrderFormData): Promise<void> {
		await this.page.getByLabel(/tipo de orden/i).selectOption(data.type);
		await this.page.getByLabel(/prioridad/i).selectOption(data.priority);
		await this.page.getByLabel(/descripción/i).fill(data.description);
		await this.page.getByLabel(/id del activo/i).fill(data.assetId);
		await this.page.getByLabel(/nombre del activo/i).fill(data.assetName);
		await this.page.getByLabel(/ubicación/i).fill(data.location);

		if (data.kitTemplate) {
			await this.page.getByLabel(/plantilla de kit/i).fill(data.kitTemplate);
		}
	}

	async submitOrder(): Promise<void> {
		await this.page.getByRole("button", { name: /crear orden de trabajo/i }).click();
	}

	getOrderByTitle(title: string): Locator {
		return this.page.getByRole("row", { name: new RegExp(title, "i") });
	}

	async openOrderById(id: string): Promise<void> {
		await this.page.goto(`/orders/${id}`, { waitUntil: "domcontentloaded" });
	}

	async openOrderByAssetName(assetName: string): Promise<void> {
		const row = this.getOrderByTitle(assetName);
		await row.getByRole("button", { name: /ver detalles/i }).click();
	}

	async expectOrderVisible(assetName: string): Promise<void> {
		await expect(this.getOrderByTitle(assetName)).toBeVisible();
	}

	async expectOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
		await this.page.goto(`/orders/${orderId}`, { waitUntil: "domcontentloaded" });
		await expect(this.page.locator("header").getByTestId("order-status-badge")).toContainText(
			STATUS_LABELS[status],
		);
	}
}
