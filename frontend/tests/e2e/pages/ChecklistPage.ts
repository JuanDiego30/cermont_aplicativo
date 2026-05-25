import type { ChecklistStatus } from "@cermont/shared-types";
import { expect, type Page } from "@playwright/test";

const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
	pending: "Pendiente",
	in_progress: "En progreso",
	completed: "Completado",
	cancelled: "Cancelado",
};

export class ChecklistPage {
	constructor(private readonly page: Page) {}

	async openChecklistTab(orderId: string): Promise<void> {
		await this.page.goto(`/orders/${orderId}`, { waitUntil: "domcontentloaded" });
		const tab = this.page.getByRole("tab", { name: /ejecución/i });
		await tab.click();
		await expect(tab).toHaveAttribute("aria-selected", "true");
		await expect(this.page).toHaveURL(new RegExp(`/orders/${orderId}\\?tab=ejecucion$`));
	}

	async expectItemsLoaded(count: number): Promise<void> {
		const actualCount = await this.page.locator("button[aria-pressed]").count();
		expect(actualCount).toBeGreaterThanOrEqual(count);
	}

	async checkAllRequiredItems(): Promise<void> {
		const requiredItems = this.page.locator('button[aria-pressed="false"]:has-text("Requerido")');

		while ((await requiredItems.count()) > 0) {
			await requiredItems.first().click();
		}
	}

	async signChecklist(): Promise<void> {
		const canvas = this.page.locator('canvas[aria-label="Area para firma digital"]').first();
		await canvas.scrollIntoViewIfNeeded();
		const box = await canvas.boundingBox();

		if (!box) {
			throw new Error("Checklist signature canvas not found");
		}

		await this.page.mouse.move(box.x + 20, box.y + 20);
		await this.page.mouse.down();
		await this.page.mouse.move(box.x + box.width - 20, box.y + 35, { steps: 12 });
		await this.page.mouse.move(box.x + box.width - 40, box.y + box.height - 20, { steps: 10 });
		await this.page.mouse.up();

		await this.page.getByRole("button", { name: /completar checklist y firmar/i }).click();
	}

	async expectChecklistStatus(status: ChecklistStatus): Promise<void> {
		await expect(this.page.getByTestId("checklist-status-badge")).toContainText(
			CHECKLIST_STATUS_LABELS[status],
		);
	}
}
