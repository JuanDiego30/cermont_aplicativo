import {
	DeliveryAcceptanceStatusSchema,
	DeliveryRecordStatusSchema,
	DeliverySignatureMethodSchema,
} from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

import { FileAssetRefSchema, type FileAssetRef } from "./sub-schemas/FileAssetRefSchema";

export interface DeliveryRecordDocument extends Document {
	_id: Types.ObjectId;
	code: string;
	workOrderId: Types.ObjectId;
	technicalReportId: Types.ObjectId;
	serviceCaseId?: Types.ObjectId;
	deliveryDate?: Date;
	clientRepresentative?: string;
	clientContact?: string;
	acceptanceStatus: string;
	clientObservations?: string;
	signedDocumentRef?: string;
	signatureMethod?: string;
	signedAt?: Date;
	signedBy?: string;
	sentAt?: Date;
	sentBy?: Types.ObjectId;
	rejectedAt?: Date;
	rejectedBy?: Types.ObjectId;
	rejectionReason?: string;
	status: string;
	clientMutationIds: string[];
	fileAssets: FileAssetRef[];
	createdAt: Date;
	updatedAt: Date;
}

const deliveryRecordSchema = new Schema<DeliveryRecordDocument>(
	{
		code: { type: String, required: true, unique: true, index: true, maxlength: 40 },
		workOrderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
		technicalReportId: {
			type: Types.ObjectId,
			ref: "TechnicalReport",
			required: true,
			index: true,
		},
		serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
		deliveryDate: { type: Date },
		clientRepresentative: { type: String, maxlength: 200 },
		clientContact: { type: String, maxlength: 200 },
		acceptanceStatus: {
			type: String,
			enum: DeliveryAcceptanceStatusSchema.options,
			default: "pending",
		},
		clientObservations: { type: String, maxlength: 2000 },
		signedDocumentRef: { type: String, maxlength: 500 },
		signatureMethod: { type: String, enum: DeliverySignatureMethodSchema.options },
		signedAt: { type: Date },
		signedBy: { type: String, maxlength: 200 },
		sentAt: { type: Date },
		sentBy: { type: Types.ObjectId, ref: "User" },
		rejectedAt: { type: Date },
		rejectedBy: { type: Types.ObjectId, ref: "User" },
		rejectionReason: { type: String, maxlength: 1000 },
		status: {
			type: String,
			enum: DeliveryRecordStatusSchema.options,
			default: "draft",
			index: true,
		},
		clientMutationIds: { type: [String], default: [], index: true },
		fileAssets: { type: [FileAssetRefSchema], default: [] },
	},
	{ timestamps: true, versionKey: false },
);

deliveryRecordSchema.index(
	{ technicalReportId: 1 },
	{ unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);
deliveryRecordSchema.index({ workOrderId: 1, status: 1 });
deliveryRecordSchema.index({ serviceCaseId: 1 });
deliveryRecordSchema.index({ createdAt: -1 });

export const DeliveryRecord = model<DeliveryRecordDocument>("DeliveryRecord", deliveryRecordSchema);
