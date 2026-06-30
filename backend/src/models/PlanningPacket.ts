import { PlanningPacketStatusSchema } from "@cermont/shared-types";
import mongoose from "mongoose";
import { FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

const PlanningResourceLineSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		unit: {
			type: String,
			trim: true,
		},
	},
	{ _id: false },
);

const PlanningToolSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		available: {
			type: Boolean,
			required: true,
			default: false,
		},
		specifications: {
			type: String,
			trim: true,
		},
	},
	{ _id: false },
);

const PlanningEquipmentSchema = new mongoose.Schema(
	{
		equipmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Asset",
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
			default: 1,
		},
		available: {
			type: Boolean,
			required: true,
			default: false,
		},
		certificateRequired: {
			type: Boolean,
			default: false,
		},
	},
	{ _id: false },
);

const PlanningResponsibleSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ["ingeniero_residente", "tecnico_electricista", "hes"],
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		name: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["pending", "assigned", "signed"],
			default: "assigned",
		},
		signedAt: Date,
		signatureEvidenceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Evidence",
		},
	},
	{ _id: false },
);

const PlanningBlockerSchema = new mongoose.Schema(
	{
		blockerId: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		severity: {
			type: String,
			required: true,
		},
		resolved: {
			type: Boolean,
			default: false,
		},
		resolution: {
			type: String,
			trim: true,
		},
		resolvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		resolvedAt: Date,
	},
	{ _id: false },
);

const PlanningPacketSchema = new mongoose.Schema(
	{
		workOrderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			index: true,
		},
		responsibleInspectorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		responsibleInspectorName: {
			type: String,
			trim: true,
		},
		place: {
			type: String,
			trim: true,
		},
		plannedDate: Date,
		businessUnit: {
			type: String,
			enum: ["IT", "MNT", "SC", "GEN", "OTHER"],
			index: true,
		},
		scope: {
			type: String,
			trim: true,
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
			tools: [PlanningToolSchema],
			equipment: [PlanningEquipmentSchema],
			minimumPpe: [String],
		},
		materials: [PlanningResourceLineSchema],
		tools: [PlanningToolSchema],
		equipment: [PlanningEquipmentSchema],
		safetyElements: [PlanningResourceLineSchema],
		workerRequirements: {
			electricistas: {
				type: Number,
				min: 0,
				default: 0,
			},
			tecnicosTelecomunicacion: {
				type: Number,
				min: 0,
				default: 0,
			},
			instrumentistas: {
				type: Number,
				min: 0,
				default: 0,
			},
			obreros: {
				type: Number,
				min: 0,
				default: 0,
			},
		},
		responsibles: [PlanningResponsibleSchema],
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
		blockers: [PlanningBlockerSchema],
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
		approvalNotes: {
			type: String,
			trim: true,
		},
		costBaselineSnapshot: {
			frozenAt: Date,
			frozenBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			laborCosts: Number,
			materialCosts: Number,
			equipmentCosts: Number,
			totalBudget: Number,
			contingencyPercentage: Number,
			contingencyAmount: Number,
			grandTotal: Number,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		reopenedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		reopenedAt: Date,
		reopenReason: {
			type: String,
			trim: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		fileAssets: { type: [FileAssetRefSchema], default: [] },
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
PlanningPacketSchema.index({ businessUnit: 1, plannedDate: 1 });
PlanningPacketSchema.index({ responsibleInspectorId: 1 });

export const PlanningPacket = mongoose.model("PlanningPacket", PlanningPacketSchema);
