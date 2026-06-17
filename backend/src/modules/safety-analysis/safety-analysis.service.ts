/**
 * Safety Analysis (AST) Service
 *
 * Digital Análisis de Trabajo Seguro with approval workflow:
 * draft → reviewed → approved → completed (cancelled at any pre-terminal stage).
 * Signatures: técnico (elabora) → supervisor (revisa) → HES (aprueba).
 */

import { randomUUID } from "node:crypto";
import {
	AST_STATUS_TRANSITIONS,
	type ASTStatus,
	type CreateAST,
	type ListASTQuery,
	type SignAST,
	type UpdateAST,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { SafetyAnalysisModel } from "../../models/SafetyAnalysis";

const SIGNATURE_ROLE_TO_FIELD = {
	elaborated: "elaboratedBy",
	reviewed: "reviewedBy",
	approved: "approvedBy",
} as const;

const SIGNATURE_ROLE_TO_TYPE = {
	elaborated: "technician",
	reviewed: "supervisor",
	approved: "hes",
} as const;

export async function createAST(data: CreateAST, userId: string) {
	return SafetyAnalysisModel.create({
		...data,
		date: new Date(data.date),
		createdBy: userId,
	});
}

export async function listASTs(query: ListASTQuery) {
	const { page, limit, orderId, status } = query;
	const filter: Record<string, unknown> = {};
	if (orderId) {
		filter.orderId = orderId;
	}
	if (status) {
		filter.status = status;
	}

	const [asts, total] = await Promise.all([
		SafetyAnalysisModel.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		SafetyAnalysisModel.countDocuments(filter),
	]);

	return {
		data: asts,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}

export async function getASTById(id: string) {
	const ast = await SafetyAnalysisModel.findById(id);
	if (!ast) {
		throw new AppError("AST no encontrado", 404, "AST_NOT_FOUND");
	}
	return ast;
}

export async function updateAST(id: string, data: UpdateAST, userId: string) {
	const ast = await getASTById(id);
	if (ast.status !== "draft") {
		throw new AppError("Solo se puede editar un AST en estado borrador", 409, "AST_NOT_EDITABLE");
	}
	const updated = await SafetyAnalysisModel.findByIdAndUpdate(
		id,
		{
			...data,
			...(data.date ? { date: new Date(data.date) } : {}),
			updatedBy: userId,
		},
		{ returnDocument: "after", runValidators: true },
	);
	if (!updated) {
		throw new AppError("AST no encontrado", 404, "AST_NOT_FOUND");
	}
	return updated;
}

export async function transitionAST(id: string, target: ASTStatus, userId: string) {
	const ast = await getASTById(id);
	const allowed = AST_STATUS_TRANSITIONS[ast.status] ?? [];
	if (!allowed.includes(target)) {
		throw new AppError(
			`Transición inválida de ${ast.status} a ${target}`,
			409,
			"INVALID_FSM_TRANSITION",
		);
	}
	const updated = await SafetyAnalysisModel.findByIdAndUpdate(
		id,
		{ status: target, updatedBy: userId },
		{ returnDocument: "after" },
	);
	if (!updated) {
		throw new AppError("AST no encontrado", 404, "AST_NOT_FOUND");
	}
	return updated;
}

/**
 * Sign one of the three AST roles. Signing "reviewed" requires an elaborated
 * signature; signing "approved" requires a reviewed signature.
 */
export async function signAST(id: string, input: SignAST, userId: string) {
	const ast = await getASTById(id);

	if (input.role === "reviewed" && !ast.elaboratedBy) {
		throw new AppError(
			"El AST debe estar firmado por quien lo elaboró antes de revisarse",
			409,
			"AST_SIGNATURE_ORDER_VIOLATION",
		);
	}
	if (input.role === "approved" && !ast.reviewedBy) {
		throw new AppError(
			"El AST debe estar revisado antes de aprobarse",
			409,
			"AST_SIGNATURE_ORDER_VIOLATION",
		);
	}

	const field = SIGNATURE_ROLE_TO_FIELD[input.role];
	const signature = {
		signatureId: randomUUID(),
		signedBy: userId,
		signedByName: input.signedByName,
		role: input.role,
		signatureType: SIGNATURE_ROLE_TO_TYPE[input.role],
		...(input.signatureUrl ? { signatureUrl: input.signatureUrl } : {}),
		signedAt: new Date(),
		confirmed: true,
	};

	const updated = await SafetyAnalysisModel.findByIdAndUpdate(
		id,
		{ [field]: signature, updatedBy: userId },
		{ returnDocument: "after" },
	);
	if (!updated) {
		throw new AppError("AST no encontrado", 404, "AST_NOT_FOUND");
	}
	return updated;
}
