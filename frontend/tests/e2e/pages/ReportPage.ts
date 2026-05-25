import type { ReportStatus } from "@cermont/shared-types";
import { type Download, expect, type Page } from "@playwright/test";

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
	draft: "Borrador",
	pending_review: "En revisión",
	approved: "Aprobado",
	rejected: "Rechazado",
};

export class ReportPage {
	constructor(private readonly page: Page) {}

	async openReportTab(orderId: string): Promise<void> {
		await this.page.goto(`/orders/${orderId}`, { waitUntil: "domcontentloaded" });
		const tab = this.page.getByRole("tab", { name: /cierre/i });
		await tab.click();
		await expect(tab).toHaveAttribute("aria-selected", "true");
		await expect(this.page).toHaveURL(new RegExp(`/orders/${orderId}\\?tab=cierre$`));
	}

	async generateReport(): Promise<void> {
		await this.page.getByRole("button", { name: /generar informe/i }).click();
	}

	async sendToReview(): Promise<void> {
		await this.page.getByRole("button", { name: /enviar a revisión/i }).click();
	}

	async approveReport(): Promise<void> {
		await this.page.getByRole("button", { name: /^aprobar$/i }).click();
	}

	async downloadPDF(): Promise<Download> {
		const [download] = await Promise.all([
			this.page.waitForEvent("download"),
			this.page.getByRole("button", { name: /descargar informe/i }).click(),
		]);

		return download;
	}

	async expectReportStatus(status: ReportStatus): Promise<void> {
		await expect(this.page.getByTestId("report-status-badge")).toContainText(
			REPORT_STATUS_LABELS[status],
		);
	}

	async expectDownloadReady(): Promise<void> {
		await expect(this.page.getByRole("button", { name: /descargar informe/i })).toBeVisible();
	}
}
