import { CERMONT_OPERATIONAL_STEPS, CERMONT_STEP_STAGE_MAP } from "@cermont/shared-types";
import { describe, expect, it } from "vitest";
import {
	buildStepAdvanceAuditInput,
	buildStepSubmissionAuditInput,
} from "../../src/services/workflow-audit.service";

describe("workflow audit coverage", () => {
	it.each(
		CERMONT_OPERATIONAL_STEPS,
	)("builds a forensic submission event for step $stepNumber: $code", (step) => {
		const event = buildStepSubmissionAuditInput({
			userId: "507f1f77bcf86cd799439011",
			serviceCaseId: "507f1f77bcf86cd799439012",
			stepCode: step.code,
			entityId: "507f1f77bcf86cd799439013",
			entityCode: `ENTITY-${step.stepNumber}`,
			artifactKey: step.entityType,
			overrideCount: 0,
		});

		expect(event.action).toBe("STEP_PAYLOAD_SUBMITTED");
		expect(event.before).toMatchObject({
			stepCode: step.code,
			stage: CERMONT_STEP_STAGE_MAP[step.code],
			status: "active",
		});
		expect(event.after).toMatchObject({
			stepCode: step.code,
			stage: CERMONT_STEP_STAGE_MAP[step.code],
			status: "completed",
		});
		expect(event.metadata).toMatchObject({
			stepNumber: step.stepNumber,
			stepLabel: step.label,
			artifactKey: step.entityType,
		});
	});

	it("records both sides of a workflow transition", () => {
		const event = buildStepAdvanceAuditInput({
			userId: "507f1f77bcf86cd799439011",
			serviceCaseId: "507f1f77bcf86cd799439012",
			previousStepCode: "step_05_planning",
			previousStage: "planning",
			nextStepCode: "step_06_execution",
			nextStage: "in_execution",
			command: "ADVANCE_STEP",
		});

		expect(event.before).toEqual({
			stepCode: "step_05_planning",
			stepNumber: 5,
			stage: "planning",
		});
		expect(event.after).toEqual({
			stepCode: "step_06_execution",
			stepNumber: 6,
			stage: "in_execution",
		});
	});
});
