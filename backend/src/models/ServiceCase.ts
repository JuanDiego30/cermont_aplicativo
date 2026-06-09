/**
 * ServiceCase Model — Mongoose schema for the pipeline orchestrator
 *
 * Phase 2: Backend implementation — read-side projection
 * Derived from @cermont/shared-types ServiceCaseSchema
 *
 * This model serves as the central read-model aggregating state
 * across work requests, proposals, orders, planning, execution,
 * evidence, reports, delivery records, SES, invoices, and payments.
 */

import { type Document, model, Schema, Types } from "mongoose";
import type { DomainBlocker } from "@cermont/shared-types";

const SERVICE_CASE_STAGES = [
	"intake",
	"assessment",
	"proposal",
	"authorization",
	"planning",
	"ready_to_execute",
	"in_execution",
	"technical_closure",
	"administrative_closure",
	"ses_pending",
	"billing_pending",
	"receivable_open",
	"paid",
	"archived",
	"cancelled",
] as const;

const artifactRefSchema = new Schema(
	{
		id: { type: Types.ObjectId, required: true },
		code: { type: String },
		status: { type: String, required: true, maxlength: 60 },
		updatedAt: { type: Date, required: true },
	},
	{ _id: false },
);

const artifactsSchema = new Schema(
	{
		workRequest: { type: artifactRefSchema },
		siteVisit: { type: artifactRefSchema },
		proposal: { type: artifactRefSchema },
		purchaseOrder: { type: artifactRefSchema },
		workOrder: { type: artifactRefSchema },
		planningPacket: { type: artifactRefSchema },
		executionSession: { type: artifactRefSchema },
		technicalReport: { type: artifactRefSchema },
		deliveryRecord: { type: artifactRefSchema },
		serviceEntrySheet: { type: artifactRefSchema },
		invoice: { type: artifactRefSchema },
		payment: { type: artifactRefSchema },
	},
	{ _id: false },
);

const nextActionSchema = new Schema(
	{
		command: { type: String, required: true, maxlength: 80 },
		label: { type: String, required: true, maxlength: 200 },
		requiredRole: { type: String, required: true, maxlength: 60 },
		route: { type: String, maxlength: 200 },
	},
	{ _id: false },
);

const timelineEntrySchema = new Schema(
	{
		eventId: { type: String, required: true, maxlength: 80 },
		stage: { type: String, required: true, enum: SERVICE_CASE_STAGES },
		command: { type: String, required: true, maxlength: 80 },
		actorId: { type: Types.ObjectId, required: true },
		actorRole: { type: String, required: true, maxlength: 60 },
		occurredAt: { type: Date, required: true },
		notes: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const serviceCaseSchema = new Schema(
	{
		code: { type: String, required: true, maxlength: 40, index: true },
		clientId: { type: Types.ObjectId, index: true },
		clientName: { type: String, required: true, maxlength: 200 },
		currentStage: {
			type: String,
			required: true,
			enum: SERVICE_CASE_STAGES,
			default: "intake",
			index: true,
		},
		currentStepCode: {
			type: String,
			enum: [
				"step_01_work_request",
				"step_02_site_visit",
				"step_03_proposal",
				"step_04_purchase_order",
				"step_05_planning",
				"step_06_execution",
				"step_07_technical_report",
				"step_08_delivery_record",
				"step_09_client_signature",
				"step_10_ses_submission",
				"step_11_ses_approval",
				"step_12_invoice_submission",
				"step_13_invoice_approval",
				"step_14_payment_closure",
			],
			default: "step_01_work_request",
			index: true,
		},
		artifacts: { type: artifactsSchema, default: {} },
		blockers: { type: [Schema.Types.Mixed], default: [] },
		nextActions: { type: [nextActionSchema], default: [] },
		timeline: { type: [timelineEntrySchema], default: [] },
		financialSummary: { type: Schema.Types.Mixed },
		operationalSummary: { type: Schema.Types.Mixed },
	},
	{
		timestamps: true,
		collection: "service_cases",
	},
);

serviceCaseSchema.index({ code: 1 }, { unique: true });
serviceCaseSchema.index({ clientId: 1, currentStage: 1 });
serviceCaseSchema.index({ currentStage: 1, updatedAt: -1 });
serviceCaseSchema.index({ currentStepCode: 1 });

export type ServiceCaseDocument = Document & {
	_id: Types.ObjectId;
	code: string;
	clientId?: Types.ObjectId;
	clientName: string;
	currentStage: (typeof SERVICE_CASE_STAGES)[number];
	currentStepCode?: string;
	artifacts: Record<string, { id: Types.ObjectId; code?: string; status: string; updatedAt: Date }>;
	blockers: DomainBlocker[];
	nextActions: { command: string; label: string; requiredRole: string; route?: string }[];
	timeline: {
		eventId: string;
		stage: string;
		command: string;
		actorId: Types.ObjectId;
		actorRole: string;
		occurredAt: Date;
		notes?: string;
	}[];
	financialSummary?: Record<string, string | number | boolean | object | Date | undefined>;
	operationalSummary?: Record<string, string | number | boolean | object | Date | undefined>;
	createdAt: Date;
	updatedAt: Date;
};

export const ServiceCase = model<ServiceCaseDocument>("ServiceCase", serviceCaseSchema);
