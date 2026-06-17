/**
 * Client Signature Service — Paso 9-10 del flujo
 *
 * Captura de firma del cliente (canvas PNG base64) con metadatos legales
 * (IP, user agent, GPS, hash SHA-256), verificación y rechazo. Idempotente
 * por clientMutationId.
 */

import { createHash } from "node:crypto";
import type { CreateClientSignatureInput, ListClientSignaturesQuery } from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { saveFile } from "../../common/storage/local-storage";
import { ClientSignatureModel } from "../../models/ClientSignature";
import { Counter } from "../../models/Counter";

const MAX_SIGNATURE_BYTES = 2 * 1024 * 1024; // 2MB
const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

async function generateCode(): Promise<string> {
	const year = new Date().getFullYear();
	const sequence = await Counter.inc(`SIG-${year}`);
	return `SIG-${year}-${String(sequence).padStart(4, "0")}`;
}

function decodeSignatureImage(imageData: string): Buffer {
	const base64 = imageData.replace(/^data:image\/png;base64,/, "");
	const buffer = Buffer.from(base64, "base64");

	if (buffer.length === 0 || buffer.length > MAX_SIGNATURE_BYTES) {
		throw new AppError(
			"La imagen de la firma está vacía o excede 2MB",
			400,
			"SIGNATURE_IMAGE_INVALID_SIZE",
		);
	}
	if (!buffer.subarray(0, 4).equals(PNG_MAGIC_BYTES)) {
		throw new AppError("La firma debe ser una imagen PNG", 400, "SIGNATURE_IMAGE_NOT_PNG");
	}
	return buffer;
}

export async function createSignature(input: CreateClientSignatureInput, userId: string) {
	if (input.clientMutationId) {
		const existing = await ClientSignatureModel.findOne({
			clientMutationId: input.clientMutationId,
		});
		if (existing) {
			return existing;
		}
	}

	const buffer = decodeSignatureImage(input.imageData);
	const imageHash = createHash("sha256").update(buffer).digest("hex");
	const code = await generateCode();
	const imageUrl = await saveFile(`signature-${code.toLowerCase()}.png`, buffer);

	const { imageData: _imageData, ...metadata } = input;

	return ClientSignatureModel.create({
		...metadata,
		code,
		imageUrl,
		imageHash,
		status: "captured",
		signedAt: new Date(),
		signedBy: userId,
		...(input.gpsLocation?.capturedAt
			? {
					gpsLocation: {
						...input.gpsLocation,
						capturedAt: new Date(input.gpsLocation.capturedAt),
					},
				}
			: {}),
	});
}

export async function listSignatures(query: ListClientSignaturesQuery) {
	const { page, limit, contextType, contextId, status, clientId, dateFrom, dateTo } = query;
	const filter: Record<string, unknown> = {};
	if (contextType) {
		filter.contextType = contextType;
	}
	if (contextId) {
		filter.contextId = contextId;
	}
	if (status) {
		filter.status = status;
	}
	if (clientId) {
		filter.clientId = clientId;
	}
	if (dateFrom || dateTo) {
		filter.signedAt = {
			...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
			...(dateTo ? { $lte: new Date(dateTo) } : {}),
		};
	}

	const [signatures, total] = await Promise.all([
		ClientSignatureModel.find(filter)
			.sort({ signedAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit),
		ClientSignatureModel.countDocuments(filter),
	]);

	return {
		data: signatures,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}

export async function getSignatureById(id: string) {
	const signature = await ClientSignatureModel.findById(id);
	if (!signature) {
		throw new AppError("Firma no encontrada", 404, "SIGNATURE_NOT_FOUND");
	}
	return signature;
}

export async function verifySignature(id: string, userId: string) {
	const signature = await getSignatureById(id);
	if (signature.status !== "captured") {
		throw new AppError(
			`Solo una firma capturada puede verificarse (estado actual: ${signature.status})`,
			409,
			"INVALID_FSM_TRANSITION",
		);
	}
	const updated = await ClientSignatureModel.findByIdAndUpdate(
		id,
		{ status: "verified", verifiedAt: new Date(), verifiedBy: userId },
		{ returnDocument: "after" },
	);
	if (!updated) {
		throw new AppError("Firma no encontrada", 404, "SIGNATURE_NOT_FOUND");
	}
	return updated;
}

export async function rejectSignature(id: string, reason: string, userId: string) {
	const signature = await getSignatureById(id);
	if (signature.status === "verified" || signature.status === "rejected") {
		throw new AppError(
			`La firma ya fue ${signature.status === "verified" ? "verificada" : "rechazada"}`,
			409,
			"INVALID_FSM_TRANSITION",
		);
	}
	const updated = await ClientSignatureModel.findByIdAndUpdate(
		id,
		{ status: "rejected", rejectedAt: new Date(), rejectedBy: userId, rejectionReason: reason },
		{ returnDocument: "after" },
	);
	if (!updated) {
		throw new AppError("Firma no encontrada", 404, "SIGNATURE_NOT_FOUND");
	}
	return updated;
}
