import { type Document, model, Schema, type Types } from "mongoose";
import { removeVersionKey } from "../../common/types/safe-types";

export interface ICustomFieldDefinition extends Document {
	entityType: string;
	name: string;
	label: string;
	description?: string;
	dataType: string;
	options?: string[];
	validation: {
		required: boolean;
		min?: number;
		max?: number;
		pattern?: string;
		errorMessage?: string;
	};
	isActive: boolean;
	order: number;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: Types.ObjectId;
	updatedBy?: Types.ObjectId;
	deletedAt?: { status: string } & ({ status: "present"; value: Date } | { status: "absent" });
	deletedBy?: { status: string } & (
		| { status: "present"; value: Types.ObjectId }
		| { status: "absent" }
	);
}

const CustomFieldDefinitionSchema = new Schema<ICustomFieldDefinition>(
	{
		entityType: {
			type: String,
			required: true,
			enum: ["work_request", "order", "asset", "user", "client"],
			index: true,
		},
		name: { type: String, required: true, match: /^[a-zA-Z0-9_]+$/ },
		label: { type: String, required: true, maxlength: 100 },
		description: { type: String, maxlength: 300 },
		dataType: {
			type: String,
			required: true,
			enum: ["text", "number", "boolean", "select", "date"],
		},
		options: { type: [String], default: undefined },
		validation: {
			required: { type: Boolean, default: false },
			min: Number,
			max: Number,
			pattern: String,
			errorMessage: String,
		},
		isActive: { type: Boolean, default: true, index: true },
		order: { type: Number, default: 0 },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
		deletedAt: { type: Schema.Types.Mixed },
		deletedBy: { type: Schema.Types.Mixed },
	},
	{ timestamps: true, versionKey: false },
);

CustomFieldDefinitionSchema.index({ entityType: 1, isActive: 1, order: 1 });
CustomFieldDefinitionSchema.index({ entityType: 1, name: 1 }, { unique: true });

CustomFieldDefinitionSchema.set("toJSON", {
	transform: (_doc, ret) => removeVersionKey(ret),
});

export const CustomFieldDefinition = model<ICustomFieldDefinition>(
	"CustomFieldDefinition",
	CustomFieldDefinitionSchema,
);
