import type { ClientStatus } from "@cermont/shared-types";
import mongoose, { type Model, Schema } from "mongoose";

export interface ClientContractRecord {
	contractNumber: string;
	startDate?: Date;
	endDate?: Date;
	value?: number;
	status: "active" | "expired" | "terminated";
}

export interface ClientRecord {
	name: string;
	nit: string;
	address?: string;
	city?: string;
	industry?: string;
	contactName?: string;
	email?: string;
	phone?: string;
	contracts: ClientContractRecord[];
	status: ClientStatus;
	notes?: string;
	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const clientContractSchema = new Schema<ClientContractRecord>(
	{
		contractNumber: { type: String, required: true, maxlength: 60 },
		startDate: { type: Date },
		endDate: { type: Date },
		value: { type: Number, min: 0 },
		status: {
			type: String,
			enum: ["active", "expired", "terminated"],
			default: "active",
		},
	},
	{ _id: false },
);

const clientSchema = new Schema<ClientRecord>(
	{
		name: { type: String, required: true, maxlength: 200, trim: true },
		nit: { type: String, required: true, maxlength: 50, trim: true, unique: true },
		address: { type: String, maxlength: 300 },
		city: { type: String, maxlength: 120 },
		industry: { type: String, maxlength: 120 },
		contactName: { type: String, maxlength: 200 },
		email: { type: String, maxlength: 200 },
		phone: { type: String, maxlength: 20 },
		contracts: { type: [clientContractSchema], default: [] },
		status: {
			type: String,
			enum: ["active", "inactive", "suspended"],
			default: "active",
			index: true,
		},
		notes: { type: String, maxlength: 500 },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

clientSchema.index({ name: "text", nit: "text", contactName: "text" });
clientSchema.index({ status: 1, createdAt: -1 });

export const ClientModel: Model<ClientRecord> = mongoose.model<ClientRecord>(
	"Client",
	clientSchema,
);
