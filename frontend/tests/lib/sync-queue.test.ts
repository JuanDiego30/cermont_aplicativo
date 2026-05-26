import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dequeue, enqueue, getAll, markDeadLetter } from "@/lib/offline/sync-queue";

const baseEntry = {
	id: "11111111-1111-4111-8111-111111111111",
	endpoint: "/checklists",
	method: "POST" as const,
	payload: { orderId: "order-1" },
	createdAt: 1_700_000_000_000,
	retryCount: 0,
	idempotencyKey: "22222222-2222-4222-8222-222222222222",
};

describe("sync-queue", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		window.localStorage.clear();
	});

	it("persists entries and returns them sorted", async () => {
		await enqueue(baseEntry);
		await enqueue({
			...baseEntry,
			id: "33333333-3333-4333-8333-333333333333",
			createdAt: 1_700_000_000_100,
			idempotencyKey: "44444444-4444-4444-8444-444444444444",
			endpoint: "/evidences",
			payload: { orderId: "order-2", type: "before" },
		});

		const entries = await getAll();

		expect(entries).toHaveLength(2);
		expect(entries[0].id).toBe(baseEntry.id);
		expect(entries[1].endpoint).toBe("/evidences");
	});

	it("dequeues entries by id", async () => {
		await enqueue(baseEntry);

		await dequeue(baseEntry.id);

		await expect(getAll()).resolves.toEqual([]);
	});

	it("marks entries as dead letters without removing them", async () => {
		await enqueue(baseEntry);

		await markDeadLetter(baseEntry.id);

		const entries = await getAll();

		expect(entries).toHaveLength(1);
		expect(entries[0].status).toBe("dead_letter");
		expect(entries[0].id).toBe(baseEntry.id);
	});

	it("avoids duplicate entries when the dedupe key matches", async () => {
		await enqueue({
			...baseEntry,
			dedupeKey: "checklists:order-1",
		});

		await enqueue({
			...baseEntry,
			id: "55555555-5555-4555-8555-555555555555",
			idempotencyKey: "66666666-6666-4666-8666-666666666666",
			dedupeKey: "checklists:order-1",
		});

		const entries = await getAll();

		expect(entries).toHaveLength(1);
		expect(entries[0].id).toBe(baseEntry.id);
	});
});
