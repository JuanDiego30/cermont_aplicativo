/**
 * Order Execution Service — Business Logic Layer
 *
 * Handles operational execution phases for Work Orders:
 * - PRE_START: Mandatory guardrails before starting work.
 * - IN_EXECUTION: Tracking progress and material consumption.
 * - CLOSURE: Verification and formal field closure.
 *
 * Reference: DOC-22 Phase 2
 */

import type { ExecutionPhaseType } from "@cermont/shared-types";
import { BadRequestError, NotFoundError, UnprocessableError } from "../../_shared/common/errors";
import { parseObjectId } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { formatOrderResponse, logAudit, type OrderResponse } from "../domain/helpers";
import { updateOrderStatus } from "./state.service";

/**
 * Transition the execution phase of a work order.
 *
 * @param orderId - Order ID
 * @param targetPhase - Phase to transition to
 * @param actorRole - User role performing the action
 * @param actorId - User ID performing the action
 */
export async function transitionExecutionPhase(
	orderId: string,
	targetPhase: ExecutionPhaseType,
	actorRole: string,
	actorId: string,
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const currentPhase = order.executionPhase?.current || null;

	// Transition Validation Logic
	if (targetPhase === "PRE_START") {
		if (currentPhase !== null) {
			throw new BadRequestError("Cannot transition back to PRE_START from an active phase");
		}
		if (order.status !== "assigned") {
			throw new UnprocessableError(
				"Order must be in 'assigned' status to start PRE_START phase",
				"EXECUTION_PHASE_INVALID_ORDER_STATUS",
			);
		}

		order.executionPhase = {
			...order.executionPhase,
			current: "PRE_START",
		};
	} else if (targetPhase === "IN_EXECUTION") {
		if (currentPhase !== "PRE_START") {
			throw new BadRequestError("Must complete PRE_START before transitioning to IN_EXECUTION");
		}

		// VALIDATION: PPE, Tools, AST, PTW from Checklist
		await validatePreStartCompletion(orderId);

		// VALIDATION: At least one 'before' photo
		await validateEvidenceCount(
			orderId,
			"before",
			1,
			"At least one 'before' photo is required to start execution.",
		);

		order.executionPhase = {
			...order.executionPhase,
			current: "IN_EXECUTION",
			preStartCompletedAt: new Date(),
		};

		// AUTO-TRANSITION Order Status to 'in_progress'
		await updateOrderStatus(
			orderId,
			"in_progress",
			actorRole,
			actorId,
			"Starting phase execution.",
		);
		order.status = "in_progress";
		order.startedAt = order.startedAt ?? new Date();
	} else if (targetPhase === "CLOSURE") {
		if (currentPhase !== "IN_EXECUTION") {
			throw new BadRequestError("Must be in IN_EXECUTION before transitioning to CLOSURE");
		}

		// VALIDATION: Procedure steps completion from Kit Snapshot
		await validateProcedureStepsCompletion(order);

		// VALIDATION: At least one 'after' photo
		await validateEvidenceCount(
			orderId,
			"after",
			1,
			"At least one 'after' photo is required to close field work.",
		);

		// VALIDATION: Signature check (usually in checklist)
		await validateFieldSignature(orderId);

		order.executionPhase = {
			...order.executionPhase,
			current: "CLOSURE",
			inExecutionCompletedAt: new Date(),
			closureCompletedAt: new Date(), // Mark as fully closed in field
		};
	}

	await container.orderRepository.save(order);

	logAudit({
		action: "EXECUTION_PHASE_CHANGED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: actorId,
		before: { phase: currentPhase },
		after: { phase: targetPhase },
		metadata: {
			targetPhase,
			actorRole,
			actorId,
			timestamp: new Date().toISOString(),
		},
	});

	return formatOrderResponse(order);
}

/**
 * Update pre-start verification items.
 */
export async function updatePreStartVerification(
	orderId: string,
	items: Array<{ id: string; checked: boolean }>,
	actorRole: string,
	actorId: string,
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	if (!order.executionPhase) {
		order.executionPhase = { preStartVerification: [] };
	}

	const existingItems = order.executionPhase.preStartVerification || [];

	for (const item of items) {
		const existingIndex = existingItems.findIndex((i) => i.id === item.id);

		if (existingIndex > -1) {
			existingItems[existingIndex].checked = item.checked;
			existingItems[existingIndex].checkedAt = item.checked ? new Date() : undefined;
		} else {
			existingItems.push({
				id: item.id,
				label: item.id, // Fallback label
				checked: item.checked,
				checkedAt: item.checked ? new Date() : undefined,
			});
		}
	}

	order.executionPhase.preStartVerification = existingItems;
	(order as unknown as { markModified(path: string): void }).markModified(
		"executionPhase.preStartVerification",
	);

	await container.orderRepository.save(order);

	logAudit({
		action: "ORDER_PRE_START_VERIFIED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: actorId,
		after: { verification: order.executionPhase.preStartVerification },
		metadata: {
			actorRole,
			actorId,
			itemCount: items.length,
			timestamp: new Date().toISOString(),
		},
	});

	return formatOrderResponse(order);
}

/**
 * Validate that all mandatory items in PRE_START are checked.
 */
async function validatePreStartCompletion(orderId: string): Promise<void> {
	const checklist = await container.checklistRepository.findOneLean({
		orderId: parseObjectId(orderId),
	});

	if (!checklist) {
		throw new UnprocessableError("Checklist missing for this order", "EXECUTION_GATE_NO_CHECKLIST");
	}

	// Verify PPE and Safety items
	const pendingSafety = checklist.items.filter(
		(item) =>
			(item.category === "ppe" || item.category === "procedure") &&
			item.required &&
			!item.completed,
	);

	if (pendingSafety.length > 0) {
		throw new UnprocessableError(
			`${pendingSafety.length} safety/PPE items pending verification.`,
			"EXECUTION_GATE_PENDING_SAFETY",
		);
	}
}

/**
 * Validate evidence count for a specific type.
 */
async function validateEvidenceCount(
	orderId: string,
	type: "before" | "after",
	min: number,
	errorMessage: string,
): Promise<void> {
	const count = await container.evidenceRepository.countDocuments({
		orderId: parseObjectId(orderId),
		type,
		deletedAt: null,
	});

	if (count < min) {
		throw new UnprocessableError(
			errorMessage,
			`EXECUTION_GATE_MISSING_EVIDENCE_${type.toUpperCase()}`,
		);
	}
}

/**
 * Validate that all procedure steps in the kit snapshot are completed.
 * Note: Since we don't have a direct 'step completed' flag in the main Order doc yet
 * (it is in the checklist or reported as work performed), we check the checklist
 * for category 'procedure'.
 */
async function validateProcedureStepsCompletion(order: {
	_id: { toString(): string };
}): Promise<void> {
	const checklist = await container.checklistRepository.findOneLean({
		orderId: parseObjectId(order._id.toString()),
	});

	if (!checklist) {
		throw new UnprocessableError("Checklist missing for this order", "EXECUTION_GATE_NO_CHECKLIST");
	}

	const pendingSteps = checklist.items.filter(
		(item) => item.category === "procedure" && item.required && !item.completed,
	);

	if (pendingSteps.length > 0) {
		throw new UnprocessableError(
			`${pendingSteps.length} procedure steps pending completion.`,
			"EXECUTION_GATE_PENDING_PROCEDURE",
		);
	}
}

/**
 * Validate field signature.
 */
async function validateFieldSignature(orderId: string): Promise<void> {
	const checklist = await container.checklistRepository.findOneLean({
		orderId: parseObjectId(orderId),
	});

	if (!checklist?.signature) {
		throw new UnprocessableError(
			"Technician signature is required for field closure.",
			"EXECUTION_GATE_MISSING_SIGNATURE",
		);
	}
}
