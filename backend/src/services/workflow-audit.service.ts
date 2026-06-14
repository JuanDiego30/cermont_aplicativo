import {
	CERMONT_OPERATIONAL_STEPS,
	CERMONT_STEP_STAGE_MAP,
	type CermontOperationalStepCode,
	type ServiceCaseStage,
} from "@cermont/shared-types";
import type { AuditLogInput } from "../modules/audit/audit.service";

interface StepSubmissionAuditParams {
	userId: string;
	serviceCaseId: string;
	stepCode: CermontOperationalStepCode;
	entityId: string;
	entityCode: string;
	artifactKey: string;
	overrideCount: number;
}

interface StepAdvanceAuditParams {
	userId: string;
	serviceCaseId: string;
	previousStepCode: CermontOperationalStepCode;
	previousStage: ServiceCaseStage;
	nextStepCode: CermontOperationalStepCode;
	nextStage: ServiceCaseStage;
	command: string;
}

function operationalStep(stepCode: CermontOperationalStepCode) {
	const step = CERMONT_OPERATIONAL_STEPS.find((candidate) => candidate.code === stepCode);
	if (!step) {
		throw new Error(`Unsupported operational step: ${stepCode}`);
	}
	return step;
}

export function buildStepSubmissionAuditInput(params: StepSubmissionAuditParams): AuditLogInput {
	const step = operationalStep(params.stepCode);
	const stage = CERMONT_STEP_STAGE_MAP[params.stepCode];

	return {
		userId: params.userId,
		entity: "ServiceCase",
		entityId: params.serviceCaseId,
		action: "STEP_PAYLOAD_SUBMITTED",
		before: {
			stepCode: params.stepCode,
			stage,
			status: "active",
		},
		after: {
			stepCode: params.stepCode,
			stage,
			status: "completed",
			entityId: params.entityId,
			entityCode: params.entityCode,
		},
		metadata: {
			stepNumber: step.stepNumber,
			stepLabel: step.label,
			phase: step.phase,
			artifactKey: params.artifactKey,
			overrideCount: params.overrideCount,
		},
	};
}

export function buildStepAdvanceAuditInput(params: StepAdvanceAuditParams): AuditLogInput {
	const previousStep = operationalStep(params.previousStepCode);
	const nextStep = operationalStep(params.nextStepCode);

	return {
		userId: params.userId,
		entity: "ServiceCase",
		entityId: params.serviceCaseId,
		action: "SERVICE_CASE_STEP_ADVANCED",
		before: {
			stepCode: params.previousStepCode,
			stepNumber: previousStep.stepNumber,
			stage: params.previousStage,
		},
		after: {
			stepCode: params.nextStepCode,
			stepNumber: nextStep.stepNumber,
			stage: params.nextStage,
		},
		metadata: {
			command: params.command,
			transition: `${params.previousStepCode}->${params.nextStepCode}`,
		},
	};
}
