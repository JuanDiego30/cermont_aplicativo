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

export async function getStats(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const stats = await EvidenceService.getEvidenceStats(user);
	res.status(200).json({ success: true, data: stats });
}

export async function listEvidences(req: Request, res: Response): Promise<void> {
	const { page, limit } = PaginationQuerySchema.parse(req.query);
	const user = requireUser(req);

	const result = await EvidenceService.listEvidences(
		{
			page,
			limit,
			orderId: req.query.orderId ? String(req.query.orderId) : undefined,
			status: req.query.status ? String(req.query.status) : undefined,
		},
		user,
	);

	res.status(200).json({
		success: true,
		data: result.data,
		meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
	});
}

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

export async function getEvidenceById(req: Request, res: Response): Promise<void> {
	const { id } = EvidenceIdSchema.parse(req.params);
	const user = requireUser(req);
	const evidence = await EvidenceService.getEvidenceById(id, user);

	res.status(200).json({
		success: true,
		data: evidence,
	});
}

function tryParseGpsLocation(value: unknown) {
	if (typeof value !== "string" || value.trim().length === 0) {
		return void 0;
	}
	try {
		const parsed = JSON.parse(value);
		if (parsed && typeof parsed === "object") {
			return {
				lat: Number(parsed.lat),
				lng: Number(parsed.lng),
				capturedAt: parsed.capturedAt,
			};
		}
	} catch {
		// return void 0 and let schema validation handle it
	}
	return void 0;
}

export async function uploadEvidence(req: Request, res: Response): Promise<void> {
	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}
	const user = requireUser(req);

	const parsedGps = tryParseGpsLocation(req.body.gpsLocation);
	if (parsedGps) {
		req.body.gpsLocation = parsedGps;
	}

	const { orderId, type, title, description, capturedAt, gpsLocation } = CreateEvidenceSchema.parse(
		req.body,
	);
	const normalizedGpsLocation = gpsLocation
		? {
				lat: gpsLocation.lat,
				lng: gpsLocation.lng,
				capturedAt: gpsLocation.capturedAt ? new Date(gpsLocation.capturedAt) : new Date(),
			}
		: undefined;

	const evidence = await EvidenceService.createEvidence(
		orderId,
		type,
		req.file.buffer,
		user._id,
		{
			title,
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

export async function verifyEvidence(req: Request, res: Response): Promise<void> {
	const { id } = EvidenceIdSchema.parse(req.params);
	const user = requireUser(req);

	const evidence = await EvidenceService.verifyEvidence(id, user._id, user.role);

	res.status(200).json({
		success: true,
		data: evidence,
	});
}
