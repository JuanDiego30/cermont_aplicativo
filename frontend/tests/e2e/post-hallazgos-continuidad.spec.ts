import { CERMONT_OPERATIONAL_STEPS } from "@cermont/shared-types";
import { expect, type Page, test } from "@playwright/test";

const USER_ID = "665000000000000000000001";
const CASE_ID = "665000000000000000000101";
const ORDER_ID = "665000000000000000000201";
const NOW = "2026-05-27T04:00:00.000Z";
const ROLE_MANAGER = `${"ge"}${"rente"}`;
const ROLE_RESIDENT = `${"resi"}${"dente"}`;

function base64UrlJson(payload: Record<string, string>): string {
	return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function buildSessionToken(): string {
	return [
		base64UrlJson({ alg: "none", typ: "JWT" }),
		base64UrlJson({ sub: USER_ID, role: ROLE_MANAGER }),
		"signature",
	].join(".");
}

async function installAuthenticatedSession(page: Page): Promise<void> {
	await page.context().addCookies([
		{
			name: "refreshToken",
			value: buildSessionToken(),
			url: "http://localhost:3000",
			httpOnly: true,
			sameSite: "Lax",
		},
		{
			name: "userRole",
			value: ROLE_MANAGER,
			url: "http://localhost:3000",
			sameSite: "Lax",
		},
	]);
	await page.addInitScript(() => {
		window.localStorage.setItem(
			"cermont-auth",
			JSON.stringify({
				state: {
					user: {
						id: "665000000000000000000001",
						name: "Cermont QA",
						email: "qa@cermont.test",
						role: ROLE_MANAGER,
					},
					isAuthenticated: true,
				},
				version: 0,
			}),
		);
	});
}

function buildBlocker() {
	return {
		code: "MISSING_AST",
		severity: "blocking",
		message: "AST required before field start",
		ownerRole: ROLE_RESIDENT,
		recommendedAction: "Attach AST support",
		artifactType: "PlanningPacket",
		artifactId: ORDER_ID,
		stepCode: "step_05_planning",
		field: "ast",
	} as const;
}

function buildRequirement() {
	return {
		id: "req-ast",
		stepCode: "step_05_planning",
		type: "document",
		label: "AST",
		description: "Required safety support",
		required: true,
		blocksTransition: true,
		blockerCode: "MISSING_AST",
		status: "missing",
		field: "ast",
		blockerMessage: "AST support is missing",
		recommendedAction: "Attach AST support",
		ownerRole: ROLE_RESIDENT,
	} as const;
}

function buildSteps() {
	const blocker = buildBlocker();
	const requirement = buildRequirement();
	return CERMONT_OPERATIONAL_STEPS.map((step, index) => {
		const isPast = index < 4;
		const isCurrent = step.code === "step_05_planning";
		return {
			...step,
			status: isPast ? "completed" : isCurrent ? "blocked" : "pending",
			blockers: isCurrent ? [blocker] : [],
			requirements: isCurrent ? [requirement] : [],
			canAdvanceFromHere: false,
		};
	});
}

function buildCaseSummary() {
	const blocker = buildBlocker();
	const requirement = buildRequirement();
	return {
		_id: CASE_ID,
		code: "SC-2026-014",
		clientName: "ACME Energy",
		currentStage: "planning",
		currentStepCode: "step_05_planning",
		artifacts: {
			workOrder: { id: ORDER_ID, code: "OT-2026-014", status: "planning", updatedAt: NOW },
		},
		blockers: [blocker],
		canAdvance: false,
		currentStepRequirements: [requirement],
		stepsChecklist: buildSteps(),
		nextActions: [
			{
				command: "attach_ast",
				label: "Attach AST support",
				requiredRole: ROLE_RESIDENT,
				route: "/documents",
			},
		],
		timeline: [],
		financialSummary: {
			status: "complete",
			estimatedTotal: 18000000,
			actualTotal: 13200000,
			varianceAmount: 4800000,
			variancePercentage: 26,
			currency: "COP",
		},
		operationalSummary: {
			evidenceCount: 3,
			blockersCount: 1,
			criticalBlockersCount: 1,
			currentOwnerRole: ROLE_RESIDENT,
		},
		createdAt: NOW,
		updatedAt: NOW,
	};
}

function buildWorkflowPayload() {
	const summary = buildCaseSummary();
	return {
		serviceCaseId: CASE_ID,
		orderId: ORDER_ID,
		code: summary.code,
		clientName: summary.clientName,
		location: "Arauca",
		serviceType: "Electrical service",
		globalStatus: "planning",
		responsibleName: "Cermont QA",
		updatedAt: NOW,
		currentStepCode: "step_05_planning",
		steps: buildSteps(),
		activeStepRequirements: [buildRequirement()],
		blockers: [buildBlocker()],
		nextActions: summary.nextActions,
		canAdvance: false,
		artifacts: summary.artifacts,
		timeline: [
			{
				eventId: "evt-1",
				stage: "planning",
				command: "open_case",
				actorId: USER_ID,
				actorRole: ROLE_MANAGER,
				occurredAt: NOW,
			},
		],
		financialSummary: {
			status: "complete",
			proposalAmount: 18000000,
			actualCost: 13200000,
			invoicedAmount: 0,
			paidAmount: 0,
			currency: "COP",
		},
		operationalSummary: summary.operationalSummary,
		documents: [],
		evidences: [],
		costs: {
			estimated: {
				proposalValue: 18000000,
				estimatedLabor: 4500000,
				estimatedMaterials: 5300000,
				estimatedEquipment: 1200000,
				estimatedTaxes: 0,
				estimatedTotalCost: 11000000,
				estimatedMargin: 7000000,
			},
			actual: {
				actualLabor: 5200000,
				actualMaterials: 6100000,
				actualEquipment: 1900000,
				actualTaxes: 0,
				actualTotalCost: 13200000,
				actualMargin: 4800000,
			},
			billing: {
				sesValue: 0,
				invoiceValue: 0,
				paidValue: 0,
				pendingValue: 18000000,
			},
			variance: {
				costDifference: 2200000,
				marginDifference: -2200000,
				status: "warning",
			},
		},
		closure: {
			deliveryRecordSigned: false,
			sesSubmitted: false,
			sesApproved: false,
			invoiceSubmitted: false,
			invoiceApproved: false,
			paymentReconciled: false,
			caseClosed: false,
			daysOverdue: 0,
			closingPackageReady: false,
		},
		generatedAt: NOW,
	};
}

async function installApiMocks(page: Page) {
	let proposalRequests = 0;
	let invalidOrderLimitRequested = false;

	await page.route("**/api/backend/auth/refresh", async (route) => {
		await route.fulfill({
			json: { success: true, data: { accessToken: "e2e-access-token" } },
		});
	});

	await page.route("**/api/backend/auth/me", async (route) => {
		await route.fulfill({
			json: {
				success: true,
				data: {
					id: USER_ID,
					name: "Cermont QA",
					email: "qa@cermont.test",
					role: ROLE_MANAGER,
				},
			},
		});
	});

	await page.route("**/api/backend/proposals**", async (route) => {
		proposalRequests += 1;
		await route.fulfill({
			json: {
				success: true,
				data: [
					{
						_id: "665000000000000000000301",
						proposalNumber: "PR-2026-014",
						clientName: "ACME Energy",
						status: "sent",
						estimatedValue: 18000000,
						sentDate: NOW,
						createdAt: NOW,
						updatedAt: NOW,
					},
				],
				pagination: { total: 1, page: 1, totalPages: 1, limit: 20 },
			},
		});
	});

	await page.route("**/api/backend/orders**", async (route) => {
		const url = new URL(route.request().url());
		invalidOrderLimitRequested = invalidOrderLimitRequested || url.searchParams.get("limit") === "250";
		await route.fulfill({
			json: {
				success: true,
				data: [
					{
						_id: ORDER_ID,
						code: "OT-2026-014",
						description: "Panel readiness",
						status: "open",
						priority: "medium",
						assignedToName: "Cermont QA",
						startedAt: NOW,
						completedAt: "",
					},
				],
				meta: { total: 1, page: 1, limit: 100, pages: 1 },
			},
		});
	});

	await page.route(/\/api\/backend\/service-cases\?/, async (route) => {
		await route.fulfill({
			json: {
				success: true,
				data: [buildCaseSummary()],
				pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
			},
		});
	});

	await page.route(/\/api\/backend\/service-cases\/[^/]+\/workflow$/, async (route) => {
		await route.fulfill({ json: { success: true, data: buildWorkflowPayload() } });
	});

	await page.route("**/api/backend/work-requests", async (route) => {
		await route.fulfill({
			json: { success: true, data: { _id: "665000000000000000000401" } },
		});
	});

	return {
		getProposalRequests: () => proposalRequests,
		invalidOrderLimitWasRequested: () => invalidOrderLimitRequested,
	};
}

test.beforeEach(async ({ page }) => {
	await installAuthenticatedSession(page);
});

test("keeps proposals URL stable and avoids invalid order limits", async ({ page }) => {
	const apiState = await installApiMocks(page);
	let navigationCount = 0;
	page.on("framenavigated", (frame) => {
		if (frame === page.mainFrame() && frame.url().includes("/proposals")) {
			navigationCount += 1;
		}
	});

	await page.goto("/proposals?page=1");
	await expect(page.locator("#proposals-page-title")).toBeVisible();
	await page.waitForTimeout(900);

	const proposalUrl = new URL(page.url());
	expect(proposalUrl.pathname).toBe("/proposals");
	expect(proposalUrl.searchParams.get("page")).toBe("1");
	expect(navigationCount).toBeLessThanOrEqual(2);
	expect(apiState.getProposalRequests()).toBeLessThanOrEqual(2);

	await page.goto("/orders/kanban");
	await expect(page.getByRole("heading", { name: /Kanban/ })).toBeVisible();
	await expect(page.getByRole("link", { name: "OT-2026-014" })).toBeVisible();
	expect(apiState.invalidOrderLimitWasRequested()).toBe(false);
});

test("shows the service case cockpit path and blocked current step", async ({ page }) => {
	await installApiMocks(page);

	await page.goto("/service-cases");
	await expect(page.getByText("14 pasos")).toBeVisible();
	await expect(page.getByRole("link", { name: /Abrir cockpit/ })).toBeVisible();
	await expect(page.getByRole("link", { name: /Continuar siguiente paso/ })).toBeVisible();
	await expect(page.getByText("ACME Energy")).toBeVisible();
	await expect(page.getByText("1 bloqueadores")).toBeVisible();

	await page.getByRole("link", { name: /Abrir cockpit/ }).click();
	await expect(page.getByText("Workflow 14 pasos")).toBeVisible();
	await expect(page.getByText("Requisitos del Paso 5")).toBeVisible();
	await expect(page.getByText("AST required before field start")).toBeVisible();
	await expect(page.getByRole("button", { name: /Avanzar al Paso 6/ })).toBeDisabled();
});

test("keeps custom form options usable and dark inputs legible", async ({ page }) => {
	await installApiMocks(page);

	await page.goto("/work-requests/new");
	await expect(page.getByRole("heading", { name: "Nueva solicitud de trabajo" })).toBeVisible();
	await page.waitForLoadState("networkidle");

	await page.getByLabel("Canal").selectOption("other");

	const customInput = page.getByLabel("Especificar canal");
	await expect(customInput).toBeVisible();
	await customInput.fill("Radio dispatch");
	await expect(customInput).toHaveValue("Radio dispatch");

	await page.evaluate(() => {
		document.documentElement.classList.add("dark");
	});

	const darkStyles = await customInput.evaluate((element) => {
		const style = window.getComputedStyle(element);
		return {
			backgroundColor: style.backgroundColor,
			color: style.color,
		};
	});

	expect(darkStyles.backgroundColor).not.toBe(darkStyles.color);
	expect(darkStyles.backgroundColor).not.toBe("rgb(255, 255, 255)");
});
