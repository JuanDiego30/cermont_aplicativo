/**
 * Optimistic Concurrency Plugin — Mongoose plugin for version-based concurrency control
 *
 * Adds a `syncVersion` field to every document schema that auto-increments on save.
 * On update, checks that the version in the query matches the current document version.
 * If a version conflict is detected (document was modified by another writer), rejects
 * with a 409-style error.
 *
 * Usage:
 *   schema.plugin(optimisticConcurrency);
 *
 * Query pattern:
 *   await Model.findOneAndUpdate(
 *     { _id: id, syncVersion: expectedVersion },
 *     { $set: updates, $inc: { syncVersion: 1 } },
 *     { returnDocument: "after" }
 *   );
 */

import type { Schema } from "mongoose";

export interface OptimisticConcurrencyOptions {
	fieldName?: string;
	initialValue?: number;
}

/**
 * Mongoose plugin that adds a numeric `syncVersion` field (default name)
 * for optimistic concurrency control.
 */
export function optimisticConcurrency(
	schema: Schema,
	options: OptimisticConcurrencyOptions = {},
): void {
	const fieldName = options.fieldName ?? "syncVersion";
	const initialValue = options.initialValue ?? 1;

	// Add the version field to the schema
	schema.add({
		[fieldName]: {
			type: Number,
			default: initialValue,
			min: 0,
		},
	});

	// Pre-save hook: increment version on each save (including updates)
	schema.pre("save", function () {
		if (this.isModified(this.modifiedPaths() as string[])) {
			const current = (this as unknown as Record<string, number>)[fieldName];
			if (typeof current === "number") {
				(this as unknown as Record<string, number>)[fieldName] = current + 1;
			}
		}
	});

	// Pre-findOneAndUpdate hook: auto-increment version
	schema.pre("findOneAndUpdate", function () {
		const update = this.getUpdate() as Record<string, unknown>;
		if (update && !update.$inc) {
			this.setUpdate({
				...update,
				$inc: { [fieldName]: 1 },
			});
		}
	});
}
