import type { ActivityType } from "@cermont/shared-types";
import { expect, type Page } from "@playwright/test";

export interface MaintenanceKitFormData {
	name: string;
	activityType: ActivityType;
}

export interface StandardItemFormData {
	section?: "tool" | "equipment";
	name: string;
	quantity: number;
	specifications?: string;
	certificateRequired?: boolean;
}

export class MaintenanceCatalogPage {
	constructor(private readonly page: Page) {}

	private kitRow(name: string) {
		return this.page.getByRole("row").filter({ hasText: name }).first();
	}

	async goto(): Promise<void> {
		await this.page.goto("/maintenance", { waitUntil: "domcontentloaded" });
	}

	async clickNewKit(): Promise<void> {
		await this.page.getByRole("link", { name: /nuevo kit/i }).click();
	}

	async fillKitForm(data: MaintenanceKitFormData): Promise<void> {
		await this.page.locator("#maintenance-kit-name").fill(data.name);
		await this.page.locator("#maintenance-kit-activity-type").selectOption(data.activityType);
	}

	async addItem(item: StandardItemFormData): Promise<void> {
		const section = item.section ?? "equipment";

		if (section === "tool") {
			const rows = this.page
				.locator("article")
				.filter({ has: this.page.getByPlaceholder("Herramienta") });
			const initialCount = await rows.count();

			await this.page.getByRole("button", { name: /añadir herramienta/i }).click();
			await expect(rows).toHaveCount(initialCount + 1);
			const row = rows.nth(initialCount);

			await row.getByPlaceholder("Herramienta").fill(item.name);
			await row.getByRole("spinbutton").fill(String(item.quantity));

			if (item.specifications) {
				await row.getByPlaceholder(/ej\./i).fill(item.specifications);
			}

			return;
		}

		const rows = this.page.locator("article").filter({ has: this.page.getByPlaceholder("Equipo") });
		const initialCount = await rows.count();

		await this.page.getByRole("button", { name: /añadir equipo/i }).click();
		await expect(rows).toHaveCount(initialCount + 1);
		const row = rows.nth(initialCount);

		await row.getByPlaceholder("Equipo").fill(item.name);
		await row.getByRole("spinbutton").fill(String(item.quantity));

		const checkbox = row.getByRole("checkbox", { name: /requiere certificación/i });
		if (item.certificateRequired) {
			await checkbox.check();
		} else {
			await checkbox.uncheck();
		}
	}

	async saveKit(): Promise<void> {
		await this.page.getByRole("button", { name: /crear kit|guardar cambios/i }).click();
	}

	async expectKitVisible(name: string): Promise<void> {
		await expect(this.kitRow(name)).toBeVisible();
	}

	async openKitByName(name: string): Promise<void> {
		const row = this.kitRow(name);
		await row.getByRole("link", { name: /ver/i }).click();
	}

	async openKitEditByName(name: string): Promise<void> {
		const row = this.kitRow(name);
		await row.getByRole("link", { name: /editar/i }).click();
	}
}
