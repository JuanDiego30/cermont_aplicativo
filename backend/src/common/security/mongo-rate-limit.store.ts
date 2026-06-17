import crypto from "node:crypto";
import type { ClientRateLimitInfo, IncrementResponse, Options, Store } from "express-rate-limit";
import { RateLimitBucket } from "../../models/RateLimitBucket";

interface MongoRateLimitStoreOptions {
	prefix: string;
}

interface StoredRateLimitBucket {
	hits: number;
	expiresAt: Date;
}

export class MongoRateLimitStore implements Store {
	readonly localKeys = false;
	readonly prefix: string;
	private windowMs = 60_000;

	constructor(options: MongoRateLimitStoreOptions) {
		this.prefix = options.prefix;
	}

	init(options: Options): void {
		this.windowMs = options.windowMs;
	}

	private buildKey(key: string): string {
		const digest = crypto.createHash("sha256").update(key).digest("hex");
		return `${this.prefix}${digest}`;
	}

	async get(key: string): Promise<ClientRateLimitInfo | undefined> {
		const bucket = await RateLimitBucket.findOne({
			key: this.buildKey(key),
			expiresAt: { $gt: new Date() },
		})
			.lean<StoredRateLimitBucket>()
			.exec();

		if (!bucket) {
			return undefined;
		}

		return {
			totalHits: bucket.hits,
			resetTime: bucket.expiresAt,
		};
	}

	async increment(key: string): Promise<IncrementResponse> {
		const now = new Date();
		const nextReset = new Date(now.getTime() + this.windowMs);
		const storedKey = this.buildKey(key);
		const activeWindow = {
			$gt: [{ $ifNull: ["$expiresAt", new Date(0)] }, now],
		};

		const bucket = await RateLimitBucket.findOneAndUpdate(
			{ key: storedKey },
			[
				{
					$set: {
						key: storedKey,
						hits: {
							$cond: [activeWindow, { $add: [{ $ifNull: ["$hits", 0] }, 1] }, 1],
						},
						expiresAt: {
							$cond: [activeWindow, "$expiresAt", nextReset],
						},
					},
				},
			],
			{
				returnDocument: "after",
				updatePipeline: true,
				upsert: true,
			},
		)
			.lean<StoredRateLimitBucket>()
			.exec();

		if (!bucket) {
			throw new Error("Rate limit bucket could not be updated");
		}

		return {
			totalHits: bucket.hits,
			resetTime: bucket.expiresAt,
		};
	}

	async decrement(key: string): Promise<void> {
		await RateLimitBucket.updateOne(
			{ key: this.buildKey(key), expiresAt: { $gt: new Date() } },
			[{ $set: { hits: { $max: [0, { $subtract: ["$hits", 1] }] } } }],
			{ updatePipeline: true },
		).exec();
	}

	async resetKey(key: string): Promise<void> {
		await RateLimitBucket.deleteOne({ key: this.buildKey(key) }).exec();
	}

	async resetAll(): Promise<void> {
		await RateLimitBucket.deleteMany({ key: { $regex: `^${this.prefix}` } }).exec();
	}
}
