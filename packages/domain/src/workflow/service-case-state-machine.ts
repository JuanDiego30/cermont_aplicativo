import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStep,
	type CermontOperationalStepStatus,
	getNextOperationalStepByKey,
	getOperationalStepByKey,
} from "./operational-steps";
import {
	buildBlockers,
	canAdvanceStep,
	getAllowedActions,
	getStepRequirements,
	type ServiceCaseWorkflowSnapshot,
	type WorkflowContext,
} from "./step-requirements";

export type ServiceCaseState =
	| "pending"
	| "work_request"
	| "site_visit"
	| "proposal"
	| "purchase_order"
	| "planning"
	| "execution"
	| "evidences"
	| "technical_report"
	| "delivery_record"
	| "client_signature"
	| "ses"
	| "invoice"
	| "invoice_approval"
	| "payment"
	| "closed";

export type ServiceCaseEvent =
	| { type: "WORK_REQUEST_CREATED" }
	| { type: "SITE_VISIT_COMPLETED" }
	| { type: "PROPOSAL_APPROVED" }
	| { type: "PURCHASE_ORDER_APPROVED" }
	| { type: "PLANNING_APPROVED" }
	| { type: "EXECUTION_COMPLETED" }
	| { type: "EVIDENCE_VERIFIED" }
	| { type: "TECHNICAL_REPORT_APPROVED" }
	| { type: "DELIVERY_RECORD_GENERATED" }
	| { type: "CLIENT_SIGNATURE_REGISTERED" }
	| { type: "SES_APPROVED" }
	| { type: "INVOICE_CREATED" }
	| { type: "INVOICE_APPROVED" }
	| { type: "PAYMENT_REGISTERED" }
	| { type: "CASE_CLOSED" };

export type StepLookupResult =
	| { status: "found"; step: CermontOperationalStep }
	| { status: "complete"; step: CermontOperationalStep };

export type TransitionResult =
	| { status: "transitioned"; state: ServiceCaseState }
	| { status: "blocked"; state: ServiceCaseState; reasons: readonly string[] };

const TRANSITIONS: Readonly<
	Record<ServiceCaseState, Partial<Record<ServiceCaseEvent["type"], ServiceCaseState>>>
> = {
	pending: { WORK_REQUEST_CREATED: "work_request" },
	// CORREGIDO: work_request NO puede ir directamente a proposal.
	// Debe pasar primero por site_visit (Paso 2 del flujo CERMONT de 14 pasos).
	work_request: { SITE_VISIT_COMPLETED: "site_visit" },
	site_visit: { PROPOSAL_APPROVED: "proposal" },
	proposal: { PURCHASE_ORDER_APPROVED: "purchase_order" },
	purchase_order: { PLANNING_APPROVED: "planning" },
	planning: { EXECUTION_COMPLETED: "execution" },
	execution: { EVIDENCE_VERIFIED: "evidences" },
	evidences: { TECHNICAL_REPORT_APPROVED: "technical_report" },
	technical_report: { DELIVERY_RECORD_GENERATED: "delivery_record" },
	delivery_record: { CLIENT_SIGNATURE_REGISTERED: "client_signature" },
	client_signature: { SES_APPROVED: "ses" },
	ses: { INVOICE_CREATED: "invoice" },
	invoice: { INVOICE_APPROVED: "invoice_approval" },
	invoice_approval: { PAYMENT_REGISTERED: "payment" },
	payment: { CASE_CLOSED: "closed" },
	closed: {},
};

function normalizeStepKey(stepKey: string): string {
	if (stepKey.startsWith("step_")) {
		return stepKey.split("_").slice(2).join("_");
	}
	return stepKey;
}

export function getCurrentStep(serviceCase: ServiceCaseWorkflowSnapshot): StepLookupResult {
	const normalized = normalizeStepKey(serviceCase.currentStepKey);
	const step = getOperationalStepByKey(normalized);
	if (step) {
		return { status: "found", step };
	}
	return { status: "found", step: CERMONT_OPERATIONAL_STEPS[0] };
}

export function getNextStep(serviceCase: ServiceCaseWorkflowSnapshot): StepLookupResult {
	const current = getCurrentStep(serviceCase).step;
	const next = getNextOperationalStepByKey(current.key);
	if (next) {
		return { status: "found", step: next };
	}
	return { status: "complete", step: current };
}

export const ServiceCaseStateMachine = {
	transition(
		state: ServiceCaseState,
		event: ServiceCaseEvent,
		serviceCase: ServiceCaseWorkflowSnapshot,
		context: WorkflowContext,
	): TransitionResult {
		const gate = canAdvanceStep(serviceCase, context);
		if (!gate.allowed) {
			return {
				status: "blocked",
				state,
				reasons: gate.blockers.map((blocker) => blocker.message),
			};
		}

		const nextState = TRANSITIONS[state][event.type];
		if (!nextState) {
			return {
				status: "blocked",
				state,
				reasons: [`Evento ${event.type} no permitido desde ${state}`],
			};
		}

		return { status: "transitioned", state: nextState };
	},
};

export type {
	ServiceCaseWorkflowSnapshot,
	StepRequirement,
	WorkflowAction,
	WorkflowBlocker,
	WorkflowContext,
} from "./step-requirements";
export type { CermontOperationalStepStatus };
export { buildBlockers, canAdvanceStep, getAllowedActions, getStepRequirements };
