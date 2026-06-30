import type { DashboardSummary } from "@cermont/shared-types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardCommandCenter } from "@/modules/dashboard/ui/DashboardCommandCenter";

const summary: DashboardSummary = {
	generatedAt: "2026-06-29T15:00:00.000Z",
	operationalPipeline: {
		stages: [
			{ stage: "planning", label: "Planeación", count: 3, order: 5 },
			{ stage: "in_execution", label: "Ejecución", count: 2, order: 7 },
		],
		totalActive: 5,
		totalClosed: 4,
		completionRate: 44,
	},
	blockers: { totalBlockers: 4, criticalBlockers: 2, blockedCases: 2 },
	nextActions: [
		{ command: "review_request", label: "Revisar solicitudes", requiredRole: "residente", count: 3 },
	],
	administrativeClosure: {
		pendingDeliveryRecords: 2,
		pendingSES: 1,
		pendingInvoices: 1,
		pendingPayments: 2,
	},
	financialAging: {
		buckets: [],
		totalOutstandingAmount: 42_000_000,
		totalOverdueAmount: 18_500_000,
		overdueInvoiceCount: 2,
	},
	fieldReadiness: {
		blockingChecklistsPending: 3,
		blockingChecklistsFailed: 1,
		evidencePendingReview: 4,
		evidenceRejected: 2,
		evidenceGpsCoveragePct: 86,
		vehicleDocumentsExpiring: 2,
		vehicleDocumentsExpired: 1,
		toolCertificationsExpiring: 5,
		toolCertificationsExpired: 0,
		offlineSyncPending: 3,
		offlineSyncFailed: 1,
	},
	serviceDemand: {
		periodDays: 30,
		totalRequests: 7,
		items: [
			{ serviceType: "Refrigeración industrial", requests: 4 },
			{ serviceType: "Obra civil", requests: 3 },
		],
	},
	costVariance: {
		estimatedCost: 100_000_000,
		actualCost: 88_000_000,
		variance: -12_000_000,
		variancePct: -12,
		currency: "COP",
	},
	documentWorkload: {
		pendingImports: 1,
		pendingTemplates: 2,
		pendingResponses: 3,
		totalDocuments: 80,
	},
	assetMaintenance: {
		totalAssets: 32,
		activeMaintenance: 3,
		expiringCertificates: 7,
		overdueMaintenance: 1,
	},
	offlineSync: { pendingSyncItems: 3, syncErrors: 1 },
	recentActivity: { items: [] },
	charts: { ordersByStatus: [], ordersByMonth: [], costByCategory: [] },
};

describe("DashboardCommandCenter", () => {
	it("prioritizes actionable Cermont signals instead of generic KPIs", () => {
		render(<DashboardCommandCenter summary={summary} />);

		expect(screen.getByText("Controles críticos por resolver")).toBeInTheDocument();
		expect(screen.getByText("Evidencias por validar")).toBeInTheDocument();
		expect(screen.getByText("Expedientes por cerrar")).toBeInTheDocument();
		expect(screen.getByText("Cartera vencida")).toBeInTheDocument();
		expect(screen.queryByText("MTTR promedio")).not.toBeInTheDocument();
		expect(screen.queryByText("Ingresos del Mes")).not.toBeInTheDocument();
	});

	it("shows the actual multi-service mix returned by the backend", () => {
		render(<DashboardCommandCenter summary={summary} />);

		expect(screen.getByText("Refrigeración industrial")).toBeInTheDocument();
		expect(screen.getByText("Obra civil")).toBeInTheDocument();
		expect(screen.getByText("Demanda de servicios · últimos 30 días")).toBeInTheDocument();
	});
});
