import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteMany: vi.fn(),
	deleteOne: vi.fn(),
	findOne: vi.fn(),
	findOneAndUpdate: vi.fn(),
	updateOne: vi.fn(),
}));

vi.mock("../../src/models/RateLimitBucket", () => ({
	RateLimitBucket: {
		deleteMany: mocks.deleteMany,
		deleteOne: mocks.deleteOne,
		findOne: mocks.findOne,
		findOneAndUpdate: mocks.findOneAndUpdate,
		updateOne: mocks.updateOne,
	},
}));

import type { Options } from "express-rate-limit";
import { MongoRateLimitStore } from "../../src/common/security/mongo-rate-limit.store";

interface QueryResult<T> {
	lean: () => { exec: () => Promise<T> };
}

function queryResult<T>(value: T): QueryResult<T> {
	return {
		lean: () => ({
			exec: async () => value,
		}),
	};
}

function execResult(): { exec: () => Promise<void> } {
	return { exec: async () => {} };
}

describe("MongoRateLimitStore", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("hashes client identifiers and returns active counters", async () => {
		const expiresAt = new Date(Date.now() + 60_000);
		mocks.findOne.mockReturnValue(queryResult({ hits: 4, expiresAt }));
		const store = new MongoRateLimitStore({ prefix: "auth:" });

		await expect(store.get("10.0.0.12")).resolves.toEqual({
			totalHits: 4,
			resetTime: expiresAt,
		});

		const filter = mocks.findOne.mock.calls[0][0];
		expect(filter.key).toMatch(/^auth:[0-9a-f]{64}$/);
		expect(filter.key).not.toContain("10.0.0.12");
	});

	it("returns no counter when the active bucket does not exist", async () => {
		mocks.findOne.mockReturnValue(queryResult(null));
		const store = new MongoRateLimitStore({ prefix: "global:" });

		await expect(store.get("client-key")).resolves.toBeUndefined();
	});

	it("increments atomically using the configured window", async () => {
		const expiresAt = new Date(Date.now() + 5_000);
		mocks.findOneAndUpdate.mockReturnValue(queryResult({ hits: 2, expiresAt }));
		const store = new MongoRateLimitStore({ prefix: "global:" });
		store.init({ windowMs: 5_000 } as Options);

		await expect(store.increment("client-key")).resolves.toEqual({
			totalHits: 2,
			resetTime: expiresAt,
		});

		const [filter, pipeline, options] = mocks.findOneAndUpdate.mock.calls[0];
		expect(filter.key).toMatch(/^global:[0-9a-f]{64}$/);
		expect(pipeline).toHaveLength(1);
		expect(options).toEqual({ new: true, upsert: true });
	});

	it("fails closed when MongoDB does not return the updated bucket", async () => {
		mocks.findOneAndUpdate.mockReturnValue(queryResult(null));
		const store = new MongoRateLimitStore({ prefix: "auth:" });

		await expect(store.increment("client-key")).rejects.toThrow(
			"Rate limit bucket could not be updated",
		);
	});

	it("decrements and resets only hashed keys in its own namespace", async () => {
		mocks.updateOne.mockReturnValue(execResult());
		mocks.deleteOne.mockReturnValue(execResult());
		mocks.deleteMany.mockReturnValue(execResult());
		const store = new MongoRateLimitStore({ prefix: "auth:" });

		await store.decrement("client-key");
		await store.resetKey("client-key");
		await store.resetAll();

		expect(mocks.updateOne.mock.calls[0][0].key).toMatch(/^auth:[0-9a-f]{64}$/);
		expect(mocks.deleteOne.mock.calls[0][0].key).toMatch(/^auth:[0-9a-f]{64}$/);
		expect(mocks.deleteMany).toHaveBeenCalledWith({ key: { $regex: "^auth:" } });
	});
});
