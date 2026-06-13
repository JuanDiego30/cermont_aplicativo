import { type Document, model, models, Schema, Types } from "mongoose";

const REFRESH_TOKEN_STATES = ["active", "rotated", "revoked", "compromised"] as const;
const REFRESH_TOKEN_REASONS = [
	"none",
	"rotation",
	"logout",
	"password_change",
	"reuse_detected",
	"expired",
] as const;

export interface RefreshTokenDocument extends Document {
	jti: string;
	userId: Types.ObjectId;
	familyId: string;
	tokenHash: string;
	tokenVersion: number;
	expiresAt: Date;
	deleteAt: Date;
	status: {
		state: (typeof REFRESH_TOKEN_STATES)[number];
		changedAt: Date;
		reason: (typeof REFRESH_TOKEN_REASONS)[number];
		replacedByJti: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

const refreshTokenStatusSchema = new Schema<RefreshTokenDocument["status"]>(
	{
		state: {
			type: String,
			enum: REFRESH_TOKEN_STATES,
			default: "active",
			required: true,
		},
		changedAt: { type: Date, required: true, default: () => new Date() },
		reason: {
			type: String,
			enum: REFRESH_TOKEN_REASONS,
			default: "none",
			required: true,
		},
		replacedByJti: { type: String, default: "", maxlength: 100 },
	},
	{ _id: false },
);

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
	{
		jti: { type: String, required: true, unique: true, index: true, maxlength: 100 },
		userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
		familyId: { type: String, required: true, index: true, maxlength: 100 },
		tokenHash: { type: String, required: true, select: false, maxlength: 64 },
		tokenVersion: { type: Number, required: true, min: 0 },
		expiresAt: { type: Date, required: true, index: true },
		deleteAt: { type: Date, required: true, index: true },
		status: { type: refreshTokenStatusSchema, required: true, default: () => ({}) },
	},
	{ timestamps: true, versionKey: false },
);

refreshTokenSchema.index({ familyId: 1, "status.state": 1 });
refreshTokenSchema.index({ userId: 1, "status.state": 1 });
refreshTokenSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
	models.RefreshToken ?? model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);
