import { type Document, model, Schema, type Types } from "mongoose";

export interface ISystemSettingsDocument extends Document {
	key: string;
	value: unknown;
	updatedBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettingsDocument>(
	{
		key: { type: String, required: true, unique: true, index: true },
		value: { type: Schema.Types.Mixed, required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true, versionKey: false },
);

export const SystemSettings = model<ISystemSettingsDocument>(
	"SystemSettings",
	SystemSettingsSchema,
);
