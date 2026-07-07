import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

interface AuditEntry {
	action: string;
	entityType: string;
	entityId?: string;
	actorId: string;
	actorRole: string;
	requestId: string;
	metadata: Record<string, unknown>;
	ip: string;
	userAgent: string;
	timestamp: string;
}

const CRITICAL_ACTIONS = [
	"create_order",
	"approve_proposal",
	"approve_planning",
	"start_execution",
	"complete_execution",
	"reject_evidence",
	"approve_ses",
	"reject_ses",
	"approve_invoice",
	"reject_invoice",
	"register_payment",
	"reconcile_payment",
	"change_role",
	"deactivate_user",
	"delete_document",
];

const AuditLog = mongoose.model(
	"AuditLog",
	new mongoose.Schema(
		{
			action: String,
			entityType: String,
			entityId: mongoose.Schema.Types.ObjectId,
			actorId: mongoose.Schema.Types.ObjectId,
			actorRole: String,
			requestId: String,
			metadata: mongoose.Schema.Types.Mixed,
			ip: String,
			userAgent: String,
			timestamp: Date,
		},
		{ timestamps: false },
	),
);

AuditLog.collection?.createIndex({ action: 1, timestamp: -1 });
AuditLog.collection?.createIndex({ entityType: 1, entityId: 1 });
AuditLog.collection?.createIndex({ actorId: 1, timestamp: -1 });
AuditLog.collection?.createIndex({ requestId: 1 });

export function auditLog(
	action: string,
	entityType: string,
	metadata: Record<string, unknown> = {},
) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const originalSend = res.json.bind(res);
		res.json = (body: Record<string, unknown>) => {
			if (CRITICAL_ACTIONS.includes(action) && res.statusCode < 400) {
				const user = (req as unknown as Record<string, unknown>).user as
					| Record<string, unknown>
					| undefined;
				const entry: AuditEntry = {
					action,
					entityType,
					entityId:
						String(req.params.id || "") || ((body?.data as Record<string, unknown>)?._id as string),
					actorId: (user?._id as string) || "system",
					actorRole: (user?.role as string) || "system",
					requestId:
						((req as unknown as Record<string, unknown>).requestId as string) || "not_provided",
					metadata: { ...metadata, method: req.method, path: req.path, statusCode: res.statusCode },
					ip: String(req.ip ?? "") || "unknown",
					userAgent: req.get("User-Agent") || "unknown",
					timestamp: new Date().toISOString(),
				};

				AuditLog.create(entry).catch((err: Error) => {
					console.error("Audit log creation failed:", err.message);
				});
			}
			return originalSend(body);
		};
		next();
	};
}
