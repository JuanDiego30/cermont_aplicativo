import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	find: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	CostCatalogItem: {
		find: mocks.find,
	},
}));

const { suggestCosts } = await import("../../src/modules/cost/cost-suggest.service");

const baseInput = {
	activityType: "lifeline_horizontal" as const,
	location: "Caño Limón",
	locationType: "rural" as const,
	technicians: 2,
	supervisor: true,
	engineer: false,
	estimatedDuration: { days: 2, hoursPerDay: 8 },
	scopeDescription: "Instalación línea de vida horizontal 40m en estructura metálica",
	measurements: [{ description: "Longitud cable", value: 40, unit: "m" }],
	requiresFinalCertification: false,
	nightWork: false,
	adverseWeather: false,
	requiresHeightWork: true,
	requiresHotWork: false,
	requiresLockoutTagout: false,
};

function setupEmptyCatalog() {
	const chain = {
		sort: vi.fn().mockReturnThis(),
		lean: vi.fn().mockResolvedValue([]),
	};
	mocks.find.mockReturnValue(chain);
}

describe("suggestCosts", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("generates a complete breakdown for lifeline_horizontal 40m", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts(baseInput);

		// Structure checks
		expect(result.lineItems.length).toBeGreaterThan(0);
		expect(result.subtotals.materials).toBeGreaterThan(0);
		expect(result.subtotals.labor).toBeGreaterThan(0);
		expect(result.subtotals.equipment).toBeGreaterThan(0);
		expect(result.subtotals.transport).toBeGreaterThan(0);
		expect(result.directCost).toBeGreaterThan(0);
		expect(result.suggestedMarginPercent).toBeGreaterThanOrEqual(15);
		expect(result.suggestedMarginPercent).toBeLessThanOrEqual(35);
		expect(result.suggestedMarginAmount).toBeGreaterThan(0);
		expect(result.taxAmount).toBeGreaterThan(0);
		expect(result.taxRate).toBe(0.19);
		expect(result.total).toBeGreaterThan(result.directCost);
		expect(result.totalRounded).toBeGreaterThan(0);
		expect(result.totalRounded % 1000).toBe(0); // Rounded to thousands
		expect(result.observations.length).toBeGreaterThan(0);
		expect(result.suggestedActions.length).toBeGreaterThan(0);
		expect(result.activityDescription).toContain("Línea de Vida Horizontal");
		expect(result.activityDescription).toContain("Caño Limón");
	});

	it("totalRounded is always a multiple of 1000", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts(baseInput);
		expect(result.totalRounded % 1000).toBe(0);
	});

	it("suggested margin increases for height work", async () => {
		setupEmptyCatalog();

		const noHeight = await suggestCosts({ ...baseInput, requiresHeightWork: false });
		const withHeight = await suggestCosts({ ...baseInput, requiresHeightWork: true });

		expect(withHeight.suggestedMarginPercent).toBeGreaterThanOrEqual(
			noHeight.suggestedMarginPercent,
		);
	});

	it("suggested margin stays within 15-35% range", async () => {
		setupEmptyCatalog();

		// Max risk: height + night + remote + certification
		const maxRisk = await suggestCosts({
			...baseInput,
			requiresHeightWork: true,
			nightWork: true,
			locationType: "remote",
			requiresFinalCertification: true,
			requiresHotWork: true,
		});

		expect(maxRisk.suggestedMarginPercent).toBeLessThanOrEqual(35);

		// Minimal risk: urban, no extras
		const minRisk = await suggestCosts({
			...baseInput,
			requiresHeightWork: false,
			nightWork: false,
			locationType: "urban",
			requiresFinalCertification: false,
			requiresHotWork: false,
		});

		expect(minRisk.suggestedMarginPercent).toBeGreaterThanOrEqual(15);
	});

	it("includes budget comparison when clientBudget is provided", async () => {
		setupEmptyCatalog();

		const withBudget = await suggestCosts({
			...baseInput,
			clientBudget: 10_000_000,
		});

		expect(withBudget.clientBudgetComparison.status).toBe("present");
		if (withBudget.clientBudgetComparison.status === "present") {
			expect(withBudget.clientBudgetComparison.value.clientBudget).toBe(10_000_000);
			expect(typeof withBudget.clientBudgetComparison.value.isWithinBudget).toBe("boolean");
		}
	});

	it("returns absent budget comparison when no clientBudget", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts(baseInput);
		expect(result.clientBudgetComparison.status).toBe("absent");
	});

	it("includes viáticos for rural locations", async () => {
		setupEmptyCatalog();

		const rural = await suggestCosts({ ...baseInput, locationType: "rural" });
		const urban = await suggestCosts({ ...baseInput, locationType: "urban" });

		const ruralHasViaticos = rural.lineItems.some((item) => item.item.includes("Viáticos"));
		const urbanHasViaticos = urban.lineItems.some((item) => item.item.includes("Viáticos"));

		expect(ruralHasViaticos).toBe(true);
		expect(urbanHasViaticos).toBe(false);
	});

	it("includes certification cost when requiresFinalCertification is true", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts({
			...baseInput,
			requiresFinalCertification: true,
		});

		const certItem = result.lineItems.find((item) => item.item.includes("Certificación"));
		expect(certItem).toBeDefined();
		expect(certItem?.total).toBeGreaterThan(0);
	});

	it("uses certified height technician rate when requiresHeightWork is true", async () => {
		setupEmptyCatalog();

		const withHeight = await suggestCosts({
			...baseInput,
			requiresHeightWork: true,
		});

		const techItem = withHeight.lineItems.find((item) => item.item.includes("certificado"));
		expect(techItem).toBeDefined();
		expect(techItem?.unitPrice).toBe(40_000); // Certified height tech rate
	});

	it("applies night premium to labor rates", async () => {
		setupEmptyCatalog();

		const night = await suggestCosts({
			...baseInput,
			nightWork: true,
		});

		const techItem = night.lineItems.find((item) => item.item.includes("certificado"));
		expect(techItem?.unitPrice).toBe(40_000 * 1.35); // 35% night premium
	});

	it("handles user-provided materials", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts({
			...baseInput,
			materials: [
				{ name: "Tornillo especial", quantity: 50, unit: "un", estimatedPrice: 1500 },
				{ name: "Pintura anticorrosiva", quantity: 2, unit: "gal", estimatedPrice: 85000 },
			],
		});

		const userMat = result.lineItems.find((item) => item.item === "Tornillo especial");
		expect(userMat).toBeDefined();
		expect(userMat?.source).toBe("user_provided");
		expect(userMat?.unitPrice).toBe(1500);
		expect(userMat?.total).toBe(50 * 1500);
	});

	it("generates observations about height work safety", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts(baseInput);
		expect(result.observations.some((o) => o.toLowerCase().includes("certificación vigente"))).toBe(
			true,
		);
	});

	it("generates observations about rural location weather", async () => {
		setupEmptyCatalog();

		const result = await suggestCosts({ ...baseInput, locationType: "remote" });
		expect(result.observations.some((o) => o.toLowerCase().includes("clima"))).toBe(true);
	});
});
