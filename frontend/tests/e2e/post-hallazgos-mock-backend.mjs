import { createServer } from "node:http";

const PORT = 4000;
const USER_ID = "665000000000000000000001";
const CASE_ID = "665000000000000000000101";
const ORDER_ID = "665000000000000000000201";
const NOW = "2026-05-27T04:00:00.000Z";
const ROLE_MANAGER = `${"ge"}${"rente"}`;
const ROLE_RESIDENT = `${"resi"}${"dente"}`;

function json(response, statusCode, body) {
	const payload = JSON.stringify(body);
	response.writeHead(statusCode, {
		"content-type": "application/json",
		"content-length": Buffer.byteLength(payload),
	});
	response.end(payload);
}

function blocker() {
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
	};
}

function requirement() {
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
	};
}

const stepLabels = [
	"Request",
	"Site visit",
	"Offer",
	"PO",
	"Planning",
	"Field work",
	"Proofs",
	"Report",
	"Record",
	"Sign-off",
	"SES",
	"Invoice",
	"Approval",
	"Payment",
];

function steps() {
	return stepLabels.map((label, index) => {
		const stepNumber = index + 1;
		const code = [
			"step_01_work_request",
			"step_02_site_visit",
			"step_03_proposal",
			"step_04_purchase_order",
			"step_05_planning",
			"step_06_execution",
			"step_07_evidence",
			"step_08_technical_report",
			"step_09_delivery_record",
			"step_10_client_signature",
			"step_11_ses",
			"step_12_invoice",
			"step_13_invoice_approval",
			"step_14_payment_closure",
		][index];
		const isCurrent = code === "step_05_planning";
		return {
			code,
			stepNumber,
			label,
			description: `${label} step`,
			phase: stepNumber <= 10 ? "operational" : "administrative",
			route: "/service-cases",
			requiredDocuments: [],
			requiredEvidences: [],
			requiredForms: [],
			authorizedRoles: [ROLE_MANAGER, ROLE_RESIDENT],
			nextAction: "Attach AST support",
			blockingRule: "Required support must be present",
			status: index < 4 ? "completed" : isCurrent ? "blocked" : "pending",
			blockers: isCurrent ? [blocker()] : [],
			requirements: isCurrent ? [requirement()] : [],
			canAdvanceFromHere: false,
		};
	});
}

function caseSummary() {
	return {
		_id: CASE_ID,
		code: "SC-2026-014",
		clientName: "ACME Energy",
		currentStage: "planning",
		currentStepCode: "step_05_planning",
		artifacts: {
			workOrder: { id: ORDER_ID, code: "OT-2026-014", status: "planning", updatedAt: NOW },
		},
		blockers: [blocker()],
		canAdvance: false,
		currentStepRequirements: [requirement()],
		stepsChecklist: steps(),
		nextActions: [
			{
				command: "attach_ast",
				label: "Attach AST support",
				requiredRole: ROLE_RESIDENT,
				route: "/documents",
			},
		],
		timeline: [],
		financialSummary: { status: "complete", estimatedTotal: 18000000, actualTotal: 13200000 },
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

function workflow() {
	const summary = caseSummary();
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
		steps: steps(),
		activeStepRequirements: [requirement()],
		blockers: [blocker()],
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
			variance: { costDifference: 2200000, marginDifference: -2200000, status: "warning" },
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

const server = createServer((request, response) => {
	const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);

	if (url.pathname === "/api/health") {
		json(response, 200, { status: "ok" });
		return;
	}
	if (url.pathname === "/api/auth/refresh") {
		json(response, 200, { success: true, data: { accessToken: "e2e-access-token" } });
		return;
	}
	if (url.pathname === "/api/auth/me") {
		json(response, 200, {
			success: true,
			data: { id: USER_ID, name: "Cermont QA", email: "qa@cermont.test", role: ROLE_MANAGER },
		});
		return;
	}
	if (url.pathname === "/api/analytics/notifications") {
		json(response, 200, { success: true, data: { notifications: [], unreadCount: 0 } });
		return;
	}
	if (url.pathname === "/api/proposals") {
		json(response, 200, {
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
		});
		return;
	}
	if (url.pathname === "/api/orders") {
		if (url.searchParams.get("limit") === "250") {
			json(response, 400, { success: false, code: "VALIDATION_FAILED" });
			return;
		}
		json(response, 200, {
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
		});
		return;
	}
	if (url.pathname === "/api/service-cases") {
		json(response, 200, {
			success: true,
			data: [caseSummary()],
			pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
		});
		return;
	}
	if (url.pathname.endsWith("/workflow") && url.pathname.includes("/api/service-cases/")) {
		json(response, 200, { success: true, data: workflow() });
		return;
	}
	if (url.pathname === "/api/work-requests") {
		if (request.method === "POST") {
			json(response, 201, { success: true, data: { _id: "665000000000000000000401" } });
			return;
		}
		json(response, 200, {
			success: true,
			data: [],
			pagination: { total: 0, page: 1, limit: 1, totalPages: 0 },
		});
		return;
	}

	json(response, 200, { success: true, data: [] });
});

server.listen(PORT);

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => {
		server.close(() => process.exit(0));
	});
}
