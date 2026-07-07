import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { OrderClosureTab } from "@/modules/orders/ui/detail/OrderClosureTab";

type MockClosureRequirement = {
	kind: string;
	label: string;
	message?: string;
	status: string;
	stepCode: string;
};

type MockClosureReport = {
	_id: string;
	canCloseAdministratively: boolean;
	completionPercentage: number;
	createdAt: string;
	materialsUsed: string[];
	missingClosureKinds: string[];
	orderId: string;
	requirements: MockClosureRequirement[];
	updatedAt: string;
};

type MockDeliveryRecord = {
	_id?: string;
	code?: string;
	message?: string;
	signedAt?: string;
	status: string;
	workOrderId: string;
};

type MockServiceEntrySheet = {
	_id: string;
	aribaDocumentNumber?: string;
	code: string;
	status: string;
};

type MockInvoice = {
	_id: string;
	code: string;
	dueDate?: string;
	invoiceNumber?: string;
	status: string;
};

type MockPayment = {
	_id: string;
	paidAt?: string;
	paymentReference: string;
	status: string;
};

type WorkflowState = {
	closureReport: MockClosureReport;
	deliveryRecord: MockDeliveryRecord;
	invoices: MockInvoice[];
	payments: MockPayment[];
	serviceEntrySheets: MockServiceEntrySheet[];
	technicalReport: {
		_id: string;
		activitiesPerformed: string[];
		approvedAt?: string;
		code: string;
		createdAt: string;
		deviations: string[];
		equipmentUsageSnapshot: string[];
		evidenceRefs: string[];
		executionSessionId: string;
		executionSummary: string;
		findings: string[];
		generatedAt: string;
		generatedBy: string;
		incidentSnapshot: string[];
		laborSnapshot: string[];
		materialsUsedSnapshot: string[];
		signatureSnapshot: Record<string, never>;
		status: string;
		updatedAt: string;
		workOrderId: string;
	};
};

const mocks = vi.hoisted(() => {
	const workflowState: WorkflowState = {
		closureReport: {
			_id: "closure-1",
			orderId: "order-1",
			materialsUsed: [],
			requirements: [
				{
					kind: "acta_delivery",
					stepCode: "step_09_delivery_record",
					label: "Delivery record",
					status: "missing",
					message: "Generate or attach the delivery record.",
				},
				{
					kind: "client_signature",
					stepCode: "step_10_client_signature",
					label: "Client signature",
					status: "missing",
					message: "Client signature or approval is still missing.",
				},
				{
					kind: "ses_filing",
					stepCode: "step_11_ses",
					label: "SES filing",
					status: "missing",
					message: "SES has not been filed yet.",
				},
				{
					kind: "ses_approval",
					stepCode: "step_11_ses_approval",
					label: "SES approval",
					status: "missing",
					message: "SES has not been approved yet.",
				},
				{
					kind: "invoice_sent",
					stepCode: "step_12_invoice_submission",
					label: "Invoice sent",
					status: "missing",
					message: "The invoice has not been issued or sent yet.",
				},
				{
					kind: "invoice_approval",
					stepCode: "step_13_invoice_approval",
					label: "Invoice approved",
					status: "missing",
					message: "The invoice has not been approved yet.",
				},
				{
					kind: "payment_support",
					stepCode: "step_14_payment_closure",
					label: "Payment support",
					status: "missing",
					message: "Payment support or final reconciliation is still missing.",
				},
			],
			completionPercentage: 0,
			canCloseAdministratively: false,
			missingClosureKinds: [
				"acta_delivery",
				"client_signature",
				"ses_filing",
				"ses_approval",
				"invoice_sent",
				"invoice_approval",
				"payment_support",
			],
			createdAt: "2026-05-27T12:00:00.000Z",
			updatedAt: "2026-05-27T12:00:00.000Z",
		},
		deliveryRecord: {
			workOrderId: "order-1",
			status: "not_created",
			message: "No delivery record exists.",
		},
		invoices: [],
		payments: [],
		serviceEntrySheets: [],
		technicalReport: {
			_id: "tech-1",
			workOrderId: "order-1",
			executionSessionId: "exec-1",
			code: "TR-2026-0001",
			executionSummary: "Execution summary",
			activitiesPerformed: [],
			findings: [],
			deviations: [],
			materialsUsedSnapshot: [],
			laborSnapshot: [],
			equipmentUsageSnapshot: [],
			incidentSnapshot: [],
			evidenceRefs: [],
			signatureSnapshot: {},
			generatedBy: "user-1",
			generatedAt: "2026-05-27T10:00:00.000Z",
			approvedAt: "2026-05-27T11:00:00.000Z",
			status: "approved",
			createdAt: "2026-05-27T10:00:00.000Z",
			updatedAt: "2026-05-27T11:00:00.000Z",
		},
	};

	return {
		createDeliveryRecord: vi.fn(),
		push: vi.fn(),
		updateOrderStatus: vi.fn(),
		workflowState,
	};
});

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mocks.push }),
}));

vi.mock("next/link", () => ({
	default: ({ children, href, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
		<a href={String(href)} {...props}>
			{children}
		</a>
	),
}));

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

vi.mock("@/modules/documents/ui/ContextualDocumentUploadModal", () => ({
	ContextualDocumentUploadModal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/costs", () => ({
	useOrderCostSummary: () => ({
		data: { hasCosts: true },
		isLoading: false,
	}),
}));

vi.mock("@/modules/reports", () => ({
	ReportPanel: () => <div data-testid="report-panel">report-panel</div>,
	useOrderReport: () => ({
		data: { status: "approved" },
		isLoading: false,
	}),
}));

vi.mock("@/modules/orders/queries", () => ({
	useOrder: () => ({
		data: {
			_id: "order-1",
			status: "ready_for_invoicing",
			invoiceReady: true,
			reportGenerated: true,
			observations: "Administrative closeout in progress",
			completedAt: "2026-05-27T09:00:00.000Z",
		},
		isLoading: false,
	}),
	useOrderClosureReport: () => ({
		data: mocks.workflowState.closureReport,
		isLoading: false,
	}),
	useUpdateOrderStatus: () => ({
		isPending: false,
		mutateAsync: mocks.updateOrderStatus,
	}),
}));

vi.mock("@/modules/billing/queries", () => ({
	useCreateDeliveryRecordFromTechnicalReport: () => ({
		isPending: false,
		mutateAsync: mocks.createDeliveryRecord,
	}),
	useInvoicesList: () => ({
		data: { items: mocks.workflowState.invoices, total: mocks.workflowState.invoices.length },
		isLoading: false,
	}),
	useOrderDeliveryRecord: () => ({
		data: mocks.workflowState.deliveryRecord,
		isLoading: false,
	}),
	useOrderTechnicalReport: () => ({
		data: mocks.workflowState.technicalReport,
		isLoading: false,
	}),
	usePaymentsList: () => ({
		data: { items: mocks.workflowState.payments, total: mocks.workflowState.payments.length },
		isLoading: false,
	}),
	useServiceEntrySheetsList: () => ({
		data: {
			items: mocks.workflowState.serviceEntrySheets,
			total: mocks.workflowState.serviceEntrySheets.length,
		},
		isLoading: false,
	}),
}));

describe("OrderClosureTab", () => {
	beforeEach(() => {
		mocks.push.mockReset();
		mocks.updateOrderStatus.mockReset();
		mocks.createDeliveryRecord.mockReset();
		mocks.createDeliveryRecord.mockResolvedValue({
			data: { _id: "dr-1" },
		});
		mocks.workflowState.deliveryRecord = {
			workOrderId: "order-1",
			status: "not_created",
			message: "No delivery record exists.",
		};
		mocks.workflowState.serviceEntrySheets = [];
		mocks.workflowState.invoices = [];
		mocks.workflowState.payments = [];
		mocks.workflowState.closureReport = {
			...mocks.workflowState.closureReport,
			completionPercentage: 0,
			canCloseAdministratively: false,
			requirements: mocks.workflowState.closureReport.requirements.map((requirement) => ({
				...requirement,
				status: "missing",
			})),
		};
	});

	test("creates the delivery record from the order closure lane when the technical report is approved", async () => {
		render(<OrderClosureTab orderId="order-1" />);

		expect(screen.getByRole("heading", { name: "Administrative chain" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Create delivery record" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "View order SES" }).getAttribute("href")).toBe(
			"/billing/ses?workOrderId=order-1",
		);

		fireEvent.click(screen.getByRole("button", { name: "Create delivery record" }));

		await waitFor(() => expect(mocks.createDeliveryRecord).toHaveBeenCalledWith({}));
		await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/delivery-records/dr-1"));
	});

	test("renders direct links to SES, invoice and payment when records already exist", () => {
		mocks.workflowState.deliveryRecord = {
			_id: "dr-1",
			code: "DR-2026-0001",
			status: "signed",
			signedAt: "2026-05-27T12:30:00.000Z",
			workOrderId: "order-1",
		};
		mocks.workflowState.serviceEntrySheets = [
			{
				_id: "ses-1",
				code: "SES-2026-0001",
				status: "approved",
				aribaDocumentNumber: "ARIBA-7788",
			},
		];
		mocks.workflowState.invoices = [
			{
				_id: "inv-1",
				code: "INV-2026-0001",
				invoiceNumber: "FE-9001",
				status: "accepted",
				dueDate: "2026-06-03T00:00:00.000Z",
			},
		];
		mocks.workflowState.payments = [
			{
				_id: "pay-1",
				paymentReference: "PAGO-001",
				status: "reconciled",
				paidAt: "2026-06-10T15:00:00.000Z",
			},
		];
		mocks.workflowState.closureReport = {
			...mocks.workflowState.closureReport,
			completionPercentage: 100,
			canCloseAdministratively: true,
			requirements: mocks.workflowState.closureReport.requirements.map((requirement) => ({
				...requirement,
				status: "completed",
				message: void 0,
			})),
			missingClosureKinds: [],
		};

		render(<OrderClosureTab orderId="order-1" />);

		expect(screen.getByRole("link", { name: "Open delivery record" }).getAttribute("href")).toBe(
			"/delivery-records/dr-1",
		);
		expect(screen.getByRole("link", { name: "Open SES" }).getAttribute("href")).toBe(
			"/billing/ses/ses-1",
		);
		expect(screen.getByRole("link", { name: "Open invoice" }).getAttribute("href")).toBe(
			"/billing/invoices/inv-1",
		);
		expect(screen.getByRole("link", { name: "Open payment" }).getAttribute("href")).toBe(
			"/payments/pay-1",
		);
		expect(screen.getByText("FE-9001")).toBeTruthy();
		expect(screen.getByText("PAGO-001")).toBeTruthy();
	});
});
