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
	generatedAt: string;
}
