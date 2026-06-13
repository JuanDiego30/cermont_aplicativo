import { type Document, model, models, Schema } from "mongoose";

export interface RateLimitBucketDocument extends Document {
	key: string;
	hits: number;
	expiresAt: Date;
}

const rateLimitBucketSchema = new Schema<RateLimitBucketDocument>(
	{
		key: { type: String, required: true, unique: true, index: true, maxlength: 160 },
		hits: { type: Number, required: true, min: 0 },
		expiresAt: { type: Date, required: true, index: true },
	},
	{ versionKey: false },
);

rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitBucket =
	models.RateLimitBucket ??
	model<RateLimitBucketDocument>("RateLimitBucket", rateLimitBucketSchema);
