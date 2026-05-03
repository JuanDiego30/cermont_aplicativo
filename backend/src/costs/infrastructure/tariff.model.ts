import { ALL_AUTHENTICATED_ROLES, type UserRole } from "@cermont/shared-types/rbac";
import { type Document, model, Schema, Types } from "mongoose";

export interface ITariffDocument extends Document {
	role: UserRole;
	hourlyRateCOP: number;
	overtimeMultiplier: number;
	effectiveFrom: Date;
	createdBy?: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const TariffSchema = new Schema<ITariffDocument>(
	{
		role: {
			type: String,
			enum: Array.from(ALL_AUTHENTICATED_ROLES),
			required: true,
			index: true,
		},
		hourlyRateCOP: { type: Number, required: true, min: 0 },
		overtimeMultiplier: { type: Number, required: true, min: 1, default: 1.5 },
		effectiveFrom: { type: Date, required: true, default: Date.now, index: true },
		createdBy: { type: Types.ObjectId, ref: "User" },
	},
	{ timestamps: true, versionKey: false },
);

TariffSchema.index({ role: 1, effectiveFrom: -1 });

export const Tariff = model<ITariffDocument>("Tariff", TariffSchema);
