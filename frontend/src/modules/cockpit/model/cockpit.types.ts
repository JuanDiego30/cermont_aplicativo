export interface StepProgress {
	step: number;
	label: string;
	status: "completed" | "in_progress" | "blocked" | "pending";
	completedAt?: string;
}

export interface NextExpectedAction {
	stepNumber: number;
	description: string;
	assignedRoles: string[];
	urgency: "normal" | "urgent" | "overdue";
	deadline?: string;
	deepLink: string;
}

export interface Blocker {
	code: string;
	message: string;
	severity: "error" | "warning";
	moduleLink?: string;
}

export interface CockpitEvidence {
	id: string;
	type: "before" | "during" | "after" | "defect" | "safety" | "signature";
	url: string;
	thumbnailUrl?: string;
	caption?: string;
	takenAt: string;
	status: "captured" | "uploaded" | "under_review" | "verified" | "rejected";
}

export interface CockpitCostSummary {
	estimatedTotal: number;
	actualTotal: number;
	variance: number;
	marginPercent: number;
	riskLevel: "low" | "medium" | "high";
}

export interface CockpitClosureStatus {
	sesStatus: "pending" | "approved" | "rejected";
	invoiceStatus: "pending" | "issued" | "approved" | "paid";
	paymentStatus: "pending" | "registered" | "confirmed";
}

export interface CockpitData {
	serviceCaseId: string;
	code: string;
	clientName: string;
	description: string;
	riskLevel: "low" | "medium" | "high" | "critical";
	slaDeadline?: string;
	steps: StepProgress[];
	currentStep: number;
	nextAction: NextExpectedAction | null;
	blockers: Blocker[];
	evidences: CockpitEvidence[];
	costSummary: CockpitCostSummary | null;
	closureStatus: CockpitClosureStatus | null;
	generatedAt: string;
}
