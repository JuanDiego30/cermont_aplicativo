/**
 * SubmitStepPayload Service — Handles atomic step payload submission
 * with merge-controlled field inheritance.
 *
 * Each step saves only its own fields + detected overrides.
 * Canonical data is NEVER duplicated in step entities.
 */

import type { CanonicalCaseData } from "@cermont/shared-types";
import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type FieldOverride,
	type ServiceCaseStepContext,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError } from "../common/errors/AppError";
import { createLogger } from "../common/utils/logger";
import { ServiceCase } from "../models";
import { createAuditLog } from "../modules/audit/audit.service";
import { calculateStepBlockers } from "./cermont-workflow-gate.service";
import { buildServiceCaseStepContext } from "./service-case-step-context.service";

const log = createLogger("submit-step-payload");

type JsonLike = Record<string, string | number | boolean | object | Date | undefined>;

// ──────────────────────────────────────────────────────────────────────────────
// Canonical field keys — fields that belong to ServiceCase, not step entities.
// These must NOT be saved per-step.
// ──────────────────────────────────────────────────────────────────────────────

const CANONICAL_FIELD_KEYS = new Set([
	"clientId",
	"clientName",
	"contactName",
	"contactPhone",
	"contactEmail",
	"siteId",
	"siteName",
	"location",
	"businessUnit",
	"workTypeId",
	"workTypeName",
	"priority",
	"requestedDate",
	"generalScope",
]);

/**
 * Separates the payload into:
 * - stepFields: fields that belong to the current step entity
 * - canonicalChanges: fields that would update the ServiceCase canonical data
 * - overrides: fields that override previously inherited values
 */
function separatePayload(
	payload: JsonLike,
	context: ServiceCaseStepContext,
): {
	stepFields: JsonLike;
	canonicalChanges: Partial<CanonicalCaseData>;
	overrides: FieldOverride[];
} {
	const stepFields: JsonLike = {};
	const canonicalChanges: Partial<CanonicalCaseData> = {};
	const overrides: FieldOverride[] = [];

	for (const [key, value] of Object.entries(payload)) {
		// Skip internal fields
		if (key === "clientMutationId" || key === "serviceCaseId" || key === "stepCode") {
			stepFields[key] = value;
			continue;
		}

		if (CANONICAL_FIELD_KEYS.has(key)) {
			canonicalChanges[key as keyof CanonicalCaseData] = value as string;

			// Check if this field overrides an inherited value
			const inherited = context.inheritedFields.find((f) => f.key === key);
			if (inherited && String(value) !== inherited.value) {
				overrides.push({
					key,
					label: inherited.label,
					inheritedValue: inherited.value,
					overrideValue: String(value),
					reason: "", // Required — validated before save
					changedBy: "",
					changedAt: new Date().toISOString(),
				});
			}
		} else {
			stepFields[key] = value;
		}
	}

	return { stepFields, canonicalChanges, overrides };
}

/**
 * Updates the ServiceCase artifact reference for a given step.
 */
async function updateServiceCaseArtifact(
	serviceCaseId: string,
	artifactKey: string,
	entityId: Types.ObjectId,
	entityCode: string,
	status: string,
	stepCode: CermontOperationalStepCode,
	stage: string,
	userId: string,
): Promise<void> {
	const now = new Date();
	const artifactUpdate: JsonLike = {
		[`artifacts.${artifactKey}`]: {
			id: entityId,
			code: entityCode,
			status,
			updatedAt: now,
		},
		currentStepCode: stepCode,
		currentStage: stage,
	};

	await ServiceCase.findByIdAndUpdate(serviceCaseId, {
		$set: artifactUpdate,
		$push: {
			timeline: {
				eventId: `${artifactKey}_created_${entityId}`,
				stage,
				command: `${artifactKey}_created`,
				actorId: new Types.ObjectId(userId),
				actorRole: "system",
				occurredAt: now,
				notes: `${artifactKey} created for step ${stepCode}`,
			},
		},
	});
}

/**
 * Main entry point: submits a step payload with merge control.
 *
 * 1. Validates payload with schema (caller must pre-validate)
 * 2. Loads current step context
 * 3. Separates canonical vs step-specific fields
 * 4. Detects overrides (requires reason)
 * 5. Saves step entity
 * 6. Updates ServiceCase artifacts
 * 7. Logs audit
 * 8. Returns updated context
 */
export async function submitStepPayload(
	serviceCaseId: string,
	stepCode: CermontOperationalStepCode,
	payload: JsonLike,
	userId: string,
	_saveEntity: (data: JsonLike) => Promise<{ id: Types.ObjectId; code: string }>,
): Promise<{
	success: boolean;
	context?: ServiceCaseStepContext;
	error?: string;
	overrides?: FieldOverride[];
}> {
	// 1. Validate
	if (!serviceCaseId || !stepCode) {
		return { success: false, error: "serviceCaseId and stepCode are required" };
	}

	const serviceCase = await ServiceCase.findById(serviceCaseId);
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	// 2. Load current context
	const context = await buildServiceCaseStepContext(serviceCaseId, stepCode);

	// 3. Separate fields
	const { stepFields, canonicalChanges, overrides } = separatePayload(payload, context);

	// 4. Validate overrides
	const overridesWithReason = overrides.filter((o) => o.reason.length > 0);
	const overridesWithoutReason = overrides.filter((o) => o.reason.length === 0);

	if (overridesWithoutReason.length > 0) {
		return {
			success: false,
			error: `Los siguientes campos requieren motivo de cambio: ${overridesWithoutReason.map((o) => o.key).join(", ")}`,
			overrides,
		};
	}

	// 5. Save step entity
	let entityId: Types.ObjectId;
	let entityCode: string;
	try {
		const result = await _saveEntity(stepFields);
		entityId = result.id;
		entityCode = result.code;
	} catch (_error) {
		log.error("Failed to save step entity", {
			stepCode,
			errorMsg: _error instanceof Error ? _error.message : String(_error),
		});
		return { success: false, error: "Error al guardar la entidad del paso" };
	}

	// 6. Update canonical data if changed
	if (Object.keys(canonicalChanges).length > 0) {
		await ServiceCase.findByIdAndUpdate(serviceCaseId, {
			$set: canonicalChanges,
		});
	}

	// 7. Update ServiceCase artifacts
	const stepDef = CERMONT_OPERATIONAL_STEPS.find((s) => s.code === stepCode);
	const artifactKey = stepDef?.entityType ?? "unrecognized";
	const stage = stepCodeToStage(stepCode);
	await updateServiceCaseArtifact(
		serviceCaseId,
		artifactKey,
		entityId,
		entityCode,
		"completed",
		stepCode,
		stage,
		userId,
	);

	// 8. Save overrides to ServiceCase audit trail
	if (overridesWithReason.length > 0) {
		const audits = overridesWithReason.map((o) => ({
			key: o.key,
			label: o.label,
			inheritedValue: o.inheritedValue,
			overrideValue: o.overrideValue,
			reason: o.reason,
			changedBy: userId,
			changedAt: new Date().toISOString(),
		}));

		await ServiceCase.findByIdAndUpdate(serviceCaseId, {
			$push: { overrides: { $each: audits } },
		});
	}

	// 9. Audit log
	await createAuditLog({
		userId,
		entity: "ServiceCase",
		entityId: serviceCaseId,
		action: "STEP_PAYLOAD_SUBMITTED",
		before: `step:${stepCode}`,
		after: `step:${stepCode}:completed`,
		metadata: {} as Record<string, string | number | boolean>,
	});

	// 10. Recalculate blockers
	await calculateStepBlockers(serviceCaseId);

	// 11. Return updated context
	const updatedContext = await buildServiceCaseStepContext(serviceCaseId, stepCode);

	return { success: true, context: updatedContext };
}

/**
 * Maps step codes to ServiceCase stages.
 */
function stepCodeToStage(stepCode: CermontOperationalStepCode): string {
	const map: Record<string, string> = {
		step_01_work_request: "intake",
		step_02_site_visit: "assessment",
		step_03_proposal: "proposal",
		step_04_purchase_order: "authorization",
		step_05_planning: "planning",
		step_06_execution: "in_execution",
		step_07_technical_report: "technical_closure",
		step_08_delivery_record: "administrative_closure",
		step_09_client_signature: "administrative_closure",
		step_10_ses_submission: "ses_pending",
		step_11_ses_approval: "billing_pending",
		step_12_invoice_submission: "receivable_open",
		step_13_invoice_approval: "receivable_open",
		step_14_payment_closure: "paid",
	};
	return map[stepCode] ?? "intake";
}
