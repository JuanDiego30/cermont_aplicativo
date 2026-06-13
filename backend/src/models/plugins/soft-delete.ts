import { type Query, type Schema, Types } from "mongoose";

export type SoftDeleteLifecycleStatus = "active" | "archived" | "deleted";

export function activeRecordFilter(): {
	lifecycleStatus: { $ne: "deleted" };
} {
	return {
		lifecycleStatus: { $ne: "deleted" },
	};
}

function scopeActiveRecords(this: Query<object, object>): void {
	this.where(activeRecordFilter());
}

export function softDeletePlugin(schema: Schema): void {
	if (!schema.path("lifecycleStatus")) {
		schema.add({
			lifecycleStatus: {
				type: String,
				enum: ["active", "archived", "deleted"],
				default: "active",
				required: true,
				index: true,
			},
		});
	}
	if (!schema.path("deletedAt")) {
		schema.add({ deletedAt: { type: Date, index: true } });
	}
	if (!schema.path("deletedBy")) {
		schema.add({ deletedBy: { type: Types.ObjectId, ref: "User" } });
	}
	if (!schema.path("deleteReason")) {
		schema.add({ deleteReason: { type: String, trim: true, maxlength: 500 } });
	}

	schema.pre("find", scopeActiveRecords);
	schema.pre("findOne", scopeActiveRecords);
	schema.pre("countDocuments", scopeActiveRecords);
	schema.pre("findOneAndUpdate", scopeActiveRecords);
	schema.pre("updateOne", scopeActiveRecords);
	schema.pre("updateMany", scopeActiveRecords);
}
