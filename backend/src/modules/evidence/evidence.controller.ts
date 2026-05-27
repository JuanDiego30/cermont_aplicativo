/**
 * Evidence Controller — HTTP Layer
 * NO try/catch — Express 5 native
 */

import {
	CreateEvidenceSchema,
	EvidenceIdSchema,
	PaginationQuerySchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors/AppError";
import { requireUser } from "../../common/utils/request";
import * as EvidenceService from "./evidence.service";

export async function getEvidencesByOrder(req: Request, res: Response): Promise<void> {
	// Use validated params and query data from middleware
	const { orderId } = req.params as { orderId: string };
	const { page, limit } = PaginationQuerySchema.parse(req.query);
	const user = requireUser(req);

	const result = await EvidenceService.getEvidencesByOrderId(orderId, user, page, limit);

	res.setHeader("X-Total-Count", String(result.total));

	res.status(200).json({
		success: true,
		data: result.evidences,
		meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
	});
}

export async function uploadEvidence(req: Request, res: Response): Promise<void> {
	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}
	const user = requireUser(req);

	if (typeof req.body.gpsLocation === "string" && req.body.gpsLocation.trim().length > 0) {
		try {
			const parsed = JSON.parse(req.body.gpsLocation);
			if (parsed && typeof parsed === "object") {
				req.body.gpsLocation = {
					lat: Number(parsed.lat),
					lng: Number(parsed.lng),
					capturedAt: parsed.capturedAt,
				};
			}
		} catch {
			// Let Zod fail if parsing failed
		}
	}

	const { orderId, type, description, capturedAt, gpsLocation } = CreateEvidenceSchema.parse(
		req.body,
	);
	const normalizedGpsLocation = gpsLocation
		? { ...gpsLocation, capturedAt: new Date(gpsLocation.capturedAt) }
		: undefined;

	const evidence = await EvidenceService.createEvidence(
		orderId,
		type,
		req.file.buffer,
		user._id,
		{
			description,
			gpsLocation: normalizedGpsLocation,
			capturedAt: new Date(capturedAt),
		},
		{
			idempotencyKey: req.get("Idempotency-Key") ?? undefined,
		},
	);

	res.status(201).json({
		success: true,
		data: evidence,
	});
}

export async function deleteEvidence(req: Request, res: Response): Promise<void> {
	const { id } = EvidenceIdSchema.parse(req.params);
	const user = requireUser(req);

	const evidence = await EvidenceService.deleteEvidence(id, user._id);

	res.status(200).json({
		success: true,
		data: evidence,
	});
}
