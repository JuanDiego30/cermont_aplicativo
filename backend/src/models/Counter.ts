/**
 * Counter Model — Atomic sequence generator for order codes
 *
 * Uses MongoDB's findOneAndUpdate with $inc for atomic, race-condition-free
 * sequence generation across concurrent requests.
 *
 * Per DOC-09 §7: order code format OT-YYYYMM-NNNN
 */

import { type Model, model, Schema } from "mongoose";

interface ICounterDoc {
	_id: string;
	seq: number;
}

interface ICounterModel extends Model<ICounterDoc> {
	inc(key: string): Promise<number>;
}

const CounterSchema = new Schema<ICounterDoc>({
	_id: { type: String, required: true }, // e.g. "OT-202603"
	seq: { type: Number, default: 0 },
});

/**
 * Atomically increment and return the next sequence value for a given key.
 */
CounterSchema.statics.inc = async function (key: string): Promise<number> {
	const result = await this.findOneAndUpdate(
		{ _id: key },
		{ $inc: { seq: 1 } },
		{ upsert: true, returnDocument: "after" },
	);
	return result.seq;
};

export const Counter = model<ICounterDoc, ICounterModel>("Counter", CounterSchema);
