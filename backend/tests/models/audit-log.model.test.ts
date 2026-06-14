import { Types } from "mongoose";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditLog, ensureAuditLogIndexes } from "../../src/models/AuditLog";

describe("AuditLog model", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("defines forensic indexes without an automatic deletion TTL", () => {
		const indexes = AuditLog.schema.indexes();

		expect(indexes).toContainEqual([
			{ entityType: 1, entityId: 1, createdAt: -1 },
			expect.objectContaining({}),
		]);
		expect(indexes).toContainEqual([{ userId: 1, createdAt: -1 }, expect.objectContaining({})]);
		expect(indexes).toContainEqual([{ action: 1, createdAt: -1 }, expect.objectContaining({})]);
		expect(indexes.some(([, options]) => "expireAfterSeconds" in options)).toBe(false);
	});

	it("stores heterogeneous entity identifiers as indexed strings", () => {
		const entityIdPath = AuditLog.schema.path("entityId");

		expect(entityIdPath.instance).toBe("String");
	});

	it.each([
		"updateOne",
		"updateMany",
		"deleteOne",
		"deleteMany",
		"findOneAndUpdate",
	])("blocks %s operations to keep the forensic trail immutable", async (operation) => {
		const query =
			operation === "updateOne"
				? AuditLog.updateOne({}, { $set: { status: "failure" } })
				: operation === "updateMany"
					? AuditLog.updateMany({}, { $set: { status: "failure" } })
					: operation === "deleteOne"
						? AuditLog.deleteOne({})
						: operation === "deleteMany"
							? AuditLog.deleteMany({})
							: AuditLog.findOneAndUpdate({}, { $set: { status: "failure" } });

		await expect(query.exec()).rejects.toThrow("AUDIT_LOG_IMMUTABLE");
	});

	it("creates the collection before reconciling indexes on a fresh database", async () => {
		const callOrder: string[] = [];
		let collectionCreated = false;

		vi.spyOn(AuditLog, "createCollection").mockImplementation(async () => {
			callOrder.push("createCollection");
			collectionCreated = true;
			return AuditLog.collection;
		});
		vi.spyOn(AuditLog.collection, "indexes").mockImplementation(async () => {
			callOrder.push("indexes");
			if (!collectionCreated) {
				throw new Error("MongoServerError: ns does not exist: cermont.auditlogs");
			}
			return [];
		});
		vi.spyOn(AuditLog.collection, "updateMany").mockImplementation(async () => {
			callOrder.push("migrateEntityIds");
			return {
				acknowledged: true,
				matchedCount: 0,
				modifiedCount: 0,
				upsertedCount: 0,
				upsertedId: new Types.ObjectId(),
			};
		});
		vi.spyOn(AuditLog, "createIndexes").mockImplementation(async () => {
			callOrder.push("createIndexes");
		});

		await expect(ensureAuditLogIndexes()).resolves.toBeUndefined();
		expect(callOrder).toEqual(["createCollection", "migrateEntityIds", "indexes", "createIndexes"]);
	});
});
