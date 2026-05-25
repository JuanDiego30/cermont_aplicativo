import { PlanningPacketStatusSchema } from "@cermont/shared-types";
import mongoose from "mongoose";

const PlanningPacketSchema = new mongoose.Schema(
	{
		workOrderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			index: true,
		},
		schedule: {
			plannedStartAt: Date,
			plannedEndAt: Date,
			estimatedDurationHours: Number,
		},
		crew: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				name: String,
				role: String,
				certificationIds: [
					{
						type: mongoose.Schema.Types.ObjectId,
						ref: "Certificate",
					},
				],
			},
		],
		supervisorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		hesResponsibleId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		kitTemplateId: String,
		kitSnapshot: {
			kitTemplateId: String,
			name: String,
			code: String,
			version: String,
			activityType: String,
			estimatedHours: Number,
			tools: mongoose.Schema.Types.Mixed,
			equipment: mongoose.Schema.Types.Mixed,
			minimumPpe: [String],
		},
		tools: [
			{
				name: String,
				quantity: Number,
				available: Boolean,
				specifications: String,
			},
		],
		equipment: [
			{
				equipmentId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Asset",
				},
				name: String,
				quantity: Number,
				available: Boolean,
				certificateRequired: Boolean,
			},
		],
		requiredCertifications: [
			{
				certificationId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Certificate",
				},
				name: String,
				requiredForRoles: [String],
				verified: Boolean,
				expiresAt: Date,
			},
		],
		astRequired: {
			type: Boolean,
			default: false,
		},
		ptwRequired: {
			type: Boolean,
			default: false,
		},
		supportDocuments: [
			{
				documentId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Document",
				},
				name: String,
				url: String,
				documentType: String,
				uploadedAt: Date,
				required: Boolean,
			},
		],
		planningNotes: String,
		readinessChecklist: [
			{
				itemId: String,
				label: String,
				checked: {
					type: Boolean,
					default: false,
				},
				checkedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				checkedAt: Date,
			},
		],
		blockers: [
			{
				blockerId: String,
				type: String,
				description: String,
				severity: String,
				resolved: {
					type: Boolean,
					default: false,
				},
				resolution: String,
				resolvedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				resolvedAt: Date,
			},
		],
		status: {
			type: String,
			enum: PlanningPacketStatusSchema.options,
			default: "draft",
			index: true,
		},
		approvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		approvedAt: Date,
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for common queries
PlanningPacketSchema.index({ workOrderId: 1, status: 1 });
PlanningPacketSchema.index({ status: 1 });
PlanningPacketSchema.index({ supervisorId: 1 });
PlanningPacketSchema.index({ "crew.userId": 1 });

export const PlanningPacket = mongoose.model("PlanningPacket", PlanningPacketSchema);
