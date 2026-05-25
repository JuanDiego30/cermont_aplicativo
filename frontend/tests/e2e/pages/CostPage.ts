import type { CostCategory } from "@cermont/shared-types";
import { expect, type Page } from "@playwright/test";
import { formatCurrency } from "@/modules/costs/utils";

export interface CostFormData {
	description: string;
	category: CostCategory;
	estimatedAmount?: number;
	actualAmount: number;
	taxAmount?: number;
	taxRate?: number;
	currency?: string;
	notes?: string;
}

export class CostPage {
	constructor(private readonly page: Page) {}

	async openCostsTab(orderId: string): Promise<void> {
		await this.page.goto(`/orders/${orderId}`, { waitUntil: "domcontentloaded" });
		const tab = this.page.getByRole("tab", { name: /costos/i });
		await tab.click();
		await expect(tab).toHaveAttribute("aria-selected", "true");
		await expect(this.page).toHaveURL(new RegExp(`/orders/${orderId}\\?tab=costos$`));
	}

	async addCost(data: CostFormData): Promise<void> {
		await this.page.getByLabel(/descripción/i).fill(data.description);
		await this.page.getByLabel(/categoría/i).selectOption(data.category);
		await this.page.getByLabel(/estimado/i).fill(String(data.estimatedAmount ?? data.actualAmount));
		await this.page.getByLabel(/real/i).fill(String(data.actualAmount));
		await this.page
			.getByRole("spinbutton", { name: /^Impuestos$/i })
			.fill(String(data.taxAmount ?? 0));
		await this.page
			.getByRole("spinbutton", { name: /^Tasa de impuesto$/i })
			.fill(String(data.taxRate ?? 0));

		if (data.currency) {
			await this.page.getByLabel(/moneda/i).fill(data.currency);
		}

		if (data.notes) {
			await this.page.getByLabel(/observaciones/i).fill(data.notes);
		}

		await this.page.getByRole("button", { name: /registrar costo/i }).click();
	}

	async expectTotalCost(amount: number): Promise<void> {
		await expect(this.page.getByTestId("cost-total")).toContainText(formatCurrency(amount));
	}

	async expectVariance(variance: number): Promise<void> {
		await expect(this.page.getByTestId("cost-variance")).toContainText(formatCurrency(variance));
	}

	async expectCostGatePassed(): Promise<void> {
		await expect(
			this.page.getByText(/existen costos registrados para esta orden\./i),
		).toBeVisible();
	}
}
