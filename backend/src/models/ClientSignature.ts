import type {
	SignatureCaptureMethod,
	SignatureContextType,
	SignatureStatus,
} from "@cermont/shared-types";
import mongoose, { type Model, Schema } from "mongoose";

export interface ClientSignatureRecord {
	code: string;
	clientId?: mongoose.Types.ObjectId;
	clientName: string;
	clientDocumentType?: string;
	clientDocumentNumber?: string;
	clientEmail?: string;
	clientPhone?: string;
	contextType: SignatureContextType;
	contextId: mongoose.Types.ObjectId;
	contextCode?: string;
	captureMethod: SignatureCaptureMethod;
	imageUrl: string;
	imageHash?: string;
	encrypted: boolean;
	ipAddress?: string;
	userAgent?: string;
	gpsLocation?: {
		lat: number;
		lng: number;
		accuracy?: number;
		capturedAt?: Date;
	};
	deviceId?: string;
	status: SignatureStatus;
	verifiedAt?: Date;
	verifiedBy?: mongoose.Types.ObjectId;
	rejectedAt?: Date;
	rejectedBy?: mongoose.Types.ObjectId;
	rejectionReason?: string;
	expiresAt?: Date;
	signedAt: Date;
	signedBy: mongoose.Types.ObjectId;
	clientMutationId?: string;
	createdAt: Date;
	updatedAt: Date;
}

const gpsSchema = new Schema(
	{
		lat: { type: Number, required: true, min: -90, max: 90 },
		lng: { type: Number, required: true, min: -180, max: 180 },
		accuracy: { type: Number, min: 0 },
		capturedAt: { type: Date },
	},
	{ _id: false },
);

const clientSignatureSchema = new Schema<ClientSignatureRecord>(
	{
		code: { type: String, required: true, unique: true, maxlength: 40 },
		clientId: { type: Schema.Types.ObjectId, ref: "Client" },
		clientName: { type: String, required: true, maxlength: 200 },
		clientDocumentType: { type: String, enum: ["NIT", "CC", "CE", "PASAPORTE"] },
		clientDocumentNumber: { type: String, maxlength: 30 },
		clientEmail: { type: String, maxlength: 200 },
		clientPhone: { type: String, maxlength: 30 },
		contextType: {
			type: String,
			enum: [
				"delivery_record",
				"technical_report",
				"site_visit",
				"proposal_approval",
				"ses_approval",
				"work_order_acceptance",
			],
			required: true,
			index: true,
		},
		contextId: { type: Schema.Types.ObjectId, required: true, index: true },
		contextCode: { type: String, maxlength: 40 },
		captureMethod: {
			type: String,
			enum: ["canvas_touch", "canvas_mouse", "fingerprint_scanner", "uploaded_image"],
			required: true,
		},
		imageUrl: { type: String, required: true },
		imageHash: { type: String, maxlength: 128 },
		encrypted: { type: Boolean, default: false },
		ipAddress: { type: String, maxlength: 45 },
		userAgent: { type: String, maxlength: 500 },
		gpsLocation: { type: gpsSchema },
		deviceId: { type: String, maxlength: 120 },
		status: {
			type: String,
			enum: ["pending", "captured", "verified", "rejected", "expired"],
			default: "captured",
			index: true,
		},
		verifiedAt: { type: Date },
		verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
		rejectedAt: { type: Date },
		rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
		rejectionReason: { type: String, maxlength: 500 },
		expiresAt: { type: Date },
		signedAt: { type: Date, required: true },
		signedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		clientMutationId: { type: String, maxlength: 64 },
	},
	{ timestamps: true },
);

clientSignatureSchema.index({ contextType: 1, contextId: 1 });
clientSignatureSchema.index({ status: 1, createdAt: -1 });
clientSignatureSchema.index(
	{ clientMutationId: 1 },
	{ unique: true, partialFilterExpression: { clientMutationId: { $type: "string" } } },
);

export const ClientSignatureModel: Model<ClientSignatureRecord> =
	mongoose.model<ClientSignatureRecord>("ClientSignature", clientSignatureSchema);
