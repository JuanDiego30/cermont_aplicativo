import { Schema } from "mongoose";
import { describe, expect, it } from "vitest";
import { activeRecordFilter, softDeletePlugin } from "../../src/models/plugins/soft-delete";

describe("softDeletePlugin", () => {
	it("adds lifecycle and deletion metadata fields", () => {
		const schema = new Schema({ title: String });

		schema.plugin(softDeletePlugin);

		expect(schema.path("lifecycleStatus")).toBeDefined();
		expect(schema.path("deletedAt")).toBeDefined();
		expect(schema.path("deletedBy")).toBeDefined();
		expect(schema.path("deleteReason")).toBeDefined();
	});

	it("provides the active-record query scope", () => {
		expect(activeRecordFilter()).toEqual({
			lifecycleStatus: { $ne: "deleted" },
		});
	});
});
