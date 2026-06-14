import { type Document, model, Schema, Types } from "mongoose";

export interface DianConfigurationDocument extends Document {
	singletonKey: "dian";
	testSetId: string;
	softwareId: string;
	softwarePin: string;
	technicalKey: string;
	resolutionNumber: string;
	resolutionDate: Date;
	resolutionStartDate: Date;
	resolutionEndDate: Date;
	resolutionPrefix: string;
	resolutionFrom: number;
	resolutionTo: number;
	environment: "test" | "production";
	isEnabled: boolean;
	lastInvoiceNumber: number;
	updatedBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const DianConfigurationSchema = new Schema<DianConfigurationDocument>(
	{
		singletonKey: {
			type: String,
			enum: ["dian"],
			default: "dian",
			unique: true,
			immutable: true,
		},
		testSetId: { type: String, required: true },
		softwareId: { type: String, required: true },
		softwarePin: { type: String, required: true, select: false },
		technicalKey: { type: String, required: true, select: false },
		resolutionNumber: { type: String, required: true },
		resolutionDate: { type: Date, required: true },
		resolutionStartDate: { type: Date, required: true },
		resolutionEndDate: { type: Date, required: true },
		resolutionPrefix: { type: String, required: true },
		resolutionFrom: { type: Number, required: true },
		resolutionTo: { type: Number, required: true },
		environment: { type: String, enum: ["test", "production"], default: "test" },
		isEnabled: { type: Boolean, default: true },
		lastInvoiceNumber: { type: Number, default: 0 },
		updatedBy: { type: Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

DianConfigurationSchema.index({ singletonKey: 1 }, { unique: true });

export const DianConfigurationModel = model<DianConfigurationDocument>(
	"DianConfiguration",
	DianConfigurationSchema,
);
