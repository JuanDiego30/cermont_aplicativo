import type { CostBaselineDocument, Order as OrderDto } from "@cermont/shared-types";
import { ORDER_STATUS_VALUES, OrderPrioritySchema, OrderTypeSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

export { Counter } from "./counter.model";

// ═══════════════════════════════════════════════════════════════════════════════
// Order Model — Per DOC-09 §7 (Diccionario de Datos)
//
// DRY: S.S.O.T utilizando OrderDto desde @cermont/shared-types
// ÍNDICES: Compuestos optimizados para queries frecuentes
// ═══════════════════════════════════════════════════════════════════════════════

// Sub-esquemas embebidos
const MaterialItemSchema = new Schema(
	{
		name: { type: String, required: true },
		quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true },
		unitCost: { type: Number, min: 0 },
		delivered: { type: Boolean, default: false },
	},
	{ _id: false },
);

const PlanningToolSchema = new Schema(
	{
		name: { type: String, required: true },
		quantity: { type: Number, required: true, min: 1 },
		specifications: { type: String },
	},
	{ _id: false },
);

const PlanningEquipmentSchema = new Schema(
	{
		name: { type: String, required: true },
		quantity: { type: Number, required: true, min: 1 },
		certificateRequired: { type: Boolean, default: false },
	},
	{ _id: false },
);

const PlanningProcedureStepSchema = new Schema(
	{
		order: { type: Number, required: true, min: 1 },
		description: { type: String, required: true },
		type: { type: String, required: true },
		expectedValue: { type: String },
		estimatedMinutes: { type: Number, min: 0 },
		required: { type: Boolean, default: true },
		referenceDocumentId: { type: String },
	},
	{ _id: false },
);

const PlanningKitMaterialSchema = new Schema(
	{
		name: { type: String, required: true },
		sku: { type: String },
		estimatedQuantity: { type: Number, required: true, min: 0 },
		unit: { type: String, required: true },
		estimatedUnitCost: { type: Number, min: 0 },
		critical: { type: Boolean, default: false },
	},
	{ _id: false },
);

const PlanningKitSafetySchema = new Schema(
	{
		minimumPpe: { type: [String], default: [] },
		requiredPermits: { type: [String], default: [] },
		riskClassification: { type: String },
		specificRisks: { type: [String], default: [] },
		safetyObservations: { type: String },
		requiresLoto: { type: Boolean, default: false },
	},
	{ _id: false },
);

const PlanningLinkedChecklistSchema = new Schema(
	{
		templateId: { type: String, required: true },
		timing: { type: String, required: true },
		blocking: { type: Boolean, default: false },
	},
	{ _id: false },
);

const PlanningAssignmentRulesSchema = new Schema(
	{
		requiredSpecialty: { type: String },
		requiredCertifications: { type: [String], default: [] },
		minimumPeople: { type: Number, min: 1, default: 1 },
		requiresOnSiteSupervisor: { type: Boolean, default: false },
	},
	{ _id: false },
);

const PlanningKitSnapshotSchema = new Schema(
	{
		kitTemplateId: { type: String, required: true },
		name: { type: String, required: true },
		code: { type: String },
		version: { type: String },
		activityType: { type: String },
		estimatedHours: { type: Number, min: 0 },
		tools: { type: [PlanningToolSchema], default: [] },
		equipment: { type: [PlanningEquipmentSchema], default: [] },
		procedureSteps: { type: [PlanningProcedureStepSchema], default: [] },
		materials: { type: [PlanningKitMaterialSchema], default: [] },
		baseMaterialCost: { type: Number, min: 0, default: 0 },
		safety: { type: PlanningKitSafetySchema },
		linkedChecklists: { type: [PlanningLinkedChecklistSchema], default: [] },
		assignmentRules: { type: PlanningAssignmentRulesSchema },
		minimumPpe: { type: [String], default: [] },
	},
	{ _id: false },
);

const OrderPlanningSchema = new Schema(
	{
		scheduledStartAt: { type: Date },
		estimatedHours: { type: Number, min: 0 },
		crewSize: { type: Number, min: 1 },
		kitTemplateId: { type: String },
		kitSnapshot: { type: PlanningKitSnapshotSchema },
		astDocumentId: { type: Types.ObjectId, ref: "Document" },
		supportDocumentIds: [{ type: Types.ObjectId, ref: "Document" }],
		planningReadyAt: { type: Date },
		planningReadyBy: { type: Types.ObjectId, ref: "User" },
	},
	{ _id: false },
);

const OrderBillingSchema = new Schema(
	{
		sesNumber: { type: String, trim: true },
		sesStatus: {
			type: String,
			enum: ["pending", "registered", "approved"],
			default: "pending",
		},
		sesApprovedAt: { type: Date },
		invoiceNumber: { type: String, trim: true },
		invoiceStatus: {
			type: String,
			enum: ["pending", "sent", "approved", "paid"],
			default: "pending",
		},
		invoiceApprovedAt: { type: Date },
		paidAt: { type: Date },
		billingNotes: { type: String, maxlength: 3000 },
	},
	{ _id: false },
);

const GpsLocationSchema = new Schema(
	{
		lat: { type: Number, required: true },
		lng: { type: Number, required: true },
		accuracy: { type: Number },
		capturedAt: { type: Date, required: true },
	},
	{ _id: false },
);

const OrderAssetDetailsSchema = new Schema(
	{
		serialTag: { type: String, trim: true, maxlength: 120 },
		model: { type: String, trim: true, maxlength: 160 },
		manufacturer: { type: String, trim: true, maxlength: 160 },
		lastInterventionAt: { type: Date },
		warrantyStatus: {
			type: String,
			enum: ["active", "expired", "na"],
			default: "na",
		},
		conditionForWork: {
			type: String,
			enum: ["operational", "out_of_service", "isolated"],
		},
	},
	{ _id: false },
);

const OrderScheduleSlaSchema = new Schema(
	{
		scheduledStartAt: { type: Date },
		dueAt: { type: Date },
		estimatedDuration: {
			value: { type: Number, min: 0 },
			unit: { type: String, enum: ["hours", "days"], default: "hours" },
		},
		maintenanceWindow: {
			startTime: { type: String },
			endTime: { type: String },
		},
		responseLevel: {
			type: String,
			enum: ["emergency", "urgent", "standard", "scheduled"],
		},
		recurrence: {
			enabled: { type: Boolean, default: false },
			frequency: {
				type: String,
				enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
			},
			endsAt: { type: Date },
		},
	},
	{ _id: false },
);

const OrderResourceAssignmentSchema = new Schema(
	{
		technicianIds: [{ type: Types.ObjectId, ref: "User" }],
		employeeType: { type: String, enum: ["in_house", "subcontractor"] },
		supervisorId: { type: Types.ObjectId, ref: "User" },
		hesResponsibleId: { type: Types.ObjectId, ref: "User" },
		requiredCertifications: [{ type: String, trim: true, maxlength: 120 }],
		vehicleResourceId: { type: Types.ObjectId, ref: "Resource" },
	},
	{ _id: false },
);

const OrderHesSchema = new Schema(
	{
		requiresPTW: { type: Boolean, default: false },
		permitTypes: [
			{
				type: String,
				enum: ["hot_work", "confined_space", "electrical", "lifting", "heights"],
			},
		],
		requiresAST: { type: Boolean, default: false },
		riskLevel: {
			type: String,
			enum: ["low", "medium", "high", "critical"],
			default: "medium",
		},
		specificRisks: [
			{
				type: String,
				enum: ["heights", "electrical", "lifting", "confined_space", "hazardous_substances"],
			},
		],
		requiresIsolation: { type: Boolean, default: false },
		previousPtwNumber: { type: String, trim: true, maxlength: 120 },
		safetyObservations: { type: String, trim: true, maxlength: 3000 },
		ptwDocumentId: { type: Types.ObjectId, ref: "Document" },
	},
	{ _id: false },
);

const OrderCommercialSchema = new Schema(
	{
		clientName: { type: String, trim: true, maxlength: 200 },
		billingAccount: { type: String, trim: true, maxlength: 200 },
		poNumber: { type: String, trim: true, maxlength: 120 },
		contractNumber: { type: String, trim: true, maxlength: 120 },
		businessUnit: { type: String, enum: ["IT", "MNT", "SC", "GEN"] },
		priceListName: { type: String, trim: true, maxlength: 160 },
		nteAmount: { type: Number, min: 0 },
		proposalReference: { type: String, trim: true, maxlength: 160 },
		isBillable: { type: Boolean, default: false },
	},
	{ _id: false },
);

const AdditionalMaterialSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, maxlength: 200 },
		quantity: { type: Number, required: true, min: 0 },
		unit: { type: String, trim: true, maxlength: 40, default: "unidad" },
	},
	{ _id: false },
);

const OrderLogisticsSchema = new Schema(
	{
		additionalMaterials: { type: [AdditionalMaterialSchema], default: [] },
		siteAccessNotes: { type: String, trim: true, maxlength: 3000 },
		requiresSpecialTransport: { type: Boolean, default: false },
		specialTransportDescription: { type: String, trim: true, maxlength: 1000 },
		specialTools: { type: String, trim: true, maxlength: 3000 },
	},
	{ _id: false },
);

const OrderPrerequisiteSchema = new Schema(
	{
		label: { type: String, required: true, trim: true, maxlength: 200 },
		completed: { type: Boolean, default: false },
	},
	{ _id: false },
);

const OrderReferencesSchema = new Schema(
	{
		attachmentDocumentIds: [{ type: Types.ObjectId, ref: "Document" }],
		relatedOrderId: { type: Types.ObjectId, ref: "Order" },
		parentOrderId: { type: Types.ObjectId, ref: "Order" },
		internalNotes: { type: String, trim: true, maxlength: 3000 },
		technicianInstructions: { type: String, trim: true, maxlength: 3000 },
		prerequisites: { type: [OrderPrerequisiteSchema], default: [] },
	},
	{ _id: false },
);

const ExecutionPhaseSchema = new Schema(
	{
		current: {
			type: String,
			enum: ["PRE_START", "IN_EXECUTION", "CLOSURE"],
		},
		preStartCompletedAt: { type: Date },
		inExecutionCompletedAt: { type: Date },
		closureCompletedAt: { type: Date },
	},
	{ _id: false },
);

const CostBaselineItemSchema = new Schema(
	{
		description: { type: String, required: true },
		unit: { type: String, required: true },
		quantity: { type: Number, required: true },
		unitCost: { type: Number, required: true },
		total: { type: Number, required: true },
	},
	{ _id: false },
);

const CostBaselineSchema = new Schema(
	{
		proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
		proposalCode: { type: String, required: true },
		subtotal: { type: Number, required: true },
		taxRate: { type: Number, required: true },
		total: { type: Number, required: true },
		items: [CostBaselineItemSchema],
		poNumber: { type: String },
		frozenAt: { type: Date, required: true },
	},
	{ _id: false },
);

// Single Source of Truth: Inherit from OrderDto
export type OrderDocumentFields = Omit<
	OrderDto,
	| "_id"
	| "gpsLocation"
	| "assignedTo"
	| "supervisedBy"
	| "proposalId"
	| "createdBy"
	| "createdAt"
	| "updatedAt"
	| "startedAt"
	| "completedAt"
	| "planning"
	| "billing"
	| "assetDetails"
	| "scheduleSla"
	| "resourceAssignment"
	| "hes"
	| "commercial"
	| "logistics"
	| "references"
	| "dueDate"
	| "slaDueDate"
	| "reportPdfGenerated"
	| "hasApprovedReport"
	| "costBaseline"
> & {
	// Overrides for Mongoose-specific DB types
	gpsLocation?: { lat: number; lng: number; accuracy?: number; capturedAt: Date };
	assignedTo?: Types.ObjectId | string;
	assignedToName?: string;
	supervisedBy?: Types.ObjectId | string;
	proposalId?: Types.ObjectId | string;
	createdBy: Types.ObjectId | string;
	createdAt: Date;
	updatedAt: Date;
	dueDate?: Date;
	slaDueDate?: Date;
	assetDetails?: {
		serialTag?: string;
		model?: string;
		manufacturer?: string;
		lastInterventionAt?: Date;
		warrantyStatus: "active" | "expired" | "na";
		conditionForWork?: "operational" | "out_of_service" | "isolated";
	};
	planning: {
		scheduledStartAt?: Date;
		estimatedHours?: number;
		crewSize?: number;
		kitTemplateId?: string;
		kitSnapshot?: {
			kitTemplateId: string;
			name: string;
			code?: string;
			version?: string;
			activityType?: string;
			estimatedHours?: number;
			tools: Array<{ name: string; quantity: number; specifications?: string }>;
			equipment: Array<{ name: string; quantity: number; certificateRequired: boolean }>;
			procedureSteps?: Array<unknown>;
			materials?: Array<unknown>;
			baseMaterialCost?: number;
			safety?: unknown;
			linkedChecklists?: Array<unknown>;
			assignmentRules?: unknown;
			minimumPpe?: string[];
		};
		astDocumentId?: Types.ObjectId | string;
		supportDocumentIds: Array<Types.ObjectId | string>;
		planningReadyAt?: Date;
		planningReadyBy?: Types.ObjectId | string;
	};
	scheduleSla?: {
		scheduledStartAt?: Date;
		dueAt?: Date;
		estimatedDuration?: { value?: number; unit: "hours" | "days" };
		maintenanceWindow?: { startTime?: string; endTime?: string };
		responseLevel?: "emergency" | "urgent" | "standard" | "scheduled";
		recurrence?: {
			enabled: boolean;
			frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
			endsAt?: Date;
		};
	};
	resourceAssignment?: {
		technicianIds: Array<Types.ObjectId | string>;
		employeeType?: "in_house" | "subcontractor";
		supervisorId?: Types.ObjectId | string;
		hesResponsibleId?: Types.ObjectId | string;
		requiredCertifications: string[];
		vehicleResourceId?: Types.ObjectId | string;
	};
	hes?: {
		requiresPTW: boolean;
		permitTypes: Array<"hot_work" | "confined_space" | "electrical" | "lifting" | "heights">;
		requiresAST: boolean;
		riskLevel: "low" | "medium" | "high" | "critical";
		specificRisks: Array<
			"heights" | "electrical" | "lifting" | "confined_space" | "hazardous_substances"
		>;
		requiresIsolation: boolean;
		previousPtwNumber?: string;
		safetyObservations?: string;
		ptwDocumentId?: Types.ObjectId | string;
	};
	commercial?: {
		clientName?: string;
		billingAccount?: string;
		poNumber?: string;
		contractNumber?: string;
		businessUnit?: "IT" | "MNT" | "SC" | "GEN";
		priceListName?: string;
		nteAmount?: number;
		proposalReference?: string;
		isBillable: boolean;
	};
	logistics?: {
		additionalMaterials: Array<{ name: string; quantity: number; unit: string }>;
		siteAccessNotes?: string;
		requiresSpecialTransport: boolean;
		specialTransportDescription?: string;
		specialTools?: string;
	};
	references?: {
		attachmentDocumentIds: Array<Types.ObjectId | string>;
		relatedOrderId?: Types.ObjectId | string;
		parentOrderId?: Types.ObjectId | string;
		internalNotes?: string;
		technicianInstructions?: string;
		prerequisites: Array<{ label: string; completed: boolean }>;
	};
	startedAt?: Date;
	completedAt?: Date;
	billing: {
		sesNumber?: string;
		sesStatus: "pending" | "registered" | "approved";
		sesApprovedAt?: Date;
		invoiceNumber?: string;
		invoiceStatus: "pending" | "sent" | "approved" | "paid";
		invoiceApprovedAt?: Date;
		paidAt?: Date;
		billingNotes?: string;
	};
	costBaseline?: CostBaselineDocument<Types.ObjectId | string>;
};

// Interfaz del documento Orden
export interface IOrderDocument extends OrderDocumentFields, Document {}

// Schema principal
const OrderSchema = new Schema<IOrderDocument>(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			index: true,
			match: /^OT-\d{6}-\d{4}$/,
		},
		type: {
			type: String,
			enum: OrderTypeSchema.options,
			required: true,
		},
		status: {
			type: String,
			enum: ORDER_STATUS_VALUES,
			default: "open",
			index: true,
		},
		priority: {
			type: String,
			enum: OrderPrioritySchema.options,
			default: "medium",
			index: true,
		},
		description: { type: String, required: true, maxlength: 2000 },

		assetId: { type: String, required: true, index: true },
		assetName: { type: String, required: true },
		location: { type: String, required: true },
		gpsLocation: GpsLocationSchema,
		assetDetails: {
			type: OrderAssetDetailsSchema,
			default: () => ({ warrantyStatus: "na" }),
		},

		assignedTo: { type: Types.ObjectId, ref: "User", index: true },
		assignedToName: { type: String },
		supervisedBy: { type: Types.ObjectId, ref: "User" },

		materials: [MaterialItemSchema],
		scheduleSla: {
			type: OrderScheduleSlaSchema,
			default: () => ({
				estimatedDuration: { unit: "hours" },
				maintenanceWindow: {},
				recurrence: { enabled: false },
			}),
		},
		resourceAssignment: {
			type: OrderResourceAssignmentSchema,
			default: () => ({
				technicianIds: [],
				requiredCertifications: [],
			}),
		},
		hes: {
			type: OrderHesSchema,
			default: () => ({
				requiresPTW: false,
				permitTypes: [],
				requiresAST: false,
				riskLevel: "medium",
				specificRisks: [],
				requiresIsolation: false,
			}),
		},
		commercial: {
			type: OrderCommercialSchema,
			default: () => ({ isBillable: false }),
		},
		logistics: {
			type: OrderLogisticsSchema,
			default: () => ({
				additionalMaterials: [],
				requiresSpecialTransport: false,
			}),
		},
		references: {
			type: OrderReferencesSchema,
			default: () => ({
				attachmentDocumentIds: [],
				prerequisites: [],
			}),
		},
		planning: {
			type: OrderPlanningSchema,
			default: () => ({
				supportDocumentIds: [],
			}),
		},

		costBaseline: {
			type: CostBaselineSchema,
		},
		archived: { type: Boolean, default: false, index: true },

		startedAt: { type: Date },
		completedAt: { type: Date },
		observations: { type: String, maxlength: 3000 },
		invoiceReady: { type: Boolean, default: false },
		reportGenerated: { type: Boolean, default: false },
		billing: {
			type: OrderBillingSchema,
			default: () => ({
				sesStatus: "pending",
				invoiceStatus: "pending",
			}),
		},

		executionPhase: {
			type: ExecutionPhaseSchema,
			default: () => ({}),
		},

		proposalId: { type: Types.ObjectId, ref: "Proposal" },
		poNumber: { type: String, trim: true },
		dueDate: { type: Date },
		slaDueDate: { type: Date },
		createdBy: { type: Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true, versionKey: false },
);

// ═══════════════════════════════════════════════════════════════════════════════
// ÍNDICES COMPUESTOS — Optimización para queries frecuentes (per DOC-09 §9)
// ═══════════════════════════════════════════════════════════════════════════════

// Órdenes de un técnico por estado
OrderSchema.index({ status: 1, assignedTo: 1 });
OrderSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
OrderSchema.index({ status: 1, priority: 1, type: 1, createdAt: -1 });
// Listado ordenado por fecha
OrderSchema.index({ createdAt: -1 });
// Historial de un activo
OrderSchema.index({ assetId: 1, status: 1 });
// SLA / tablero de atrasos
OrderSchema.index({ "scheduleSla.dueAt": 1, status: 1 });
// Cliente / facturación
OrderSchema.index({ "commercial.clientName": 1 });
// Priorización HES
OrderSchema.index({ "hes.riskLevel": 1 });

// toJSON: limpiar __v de respuestas
OrderSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const obj = ret as unknown as Record<string, unknown>;
		delete obj.__v;
		return obj;
	},
});

export const Order = model<IOrderDocument>("Order", OrderSchema);
