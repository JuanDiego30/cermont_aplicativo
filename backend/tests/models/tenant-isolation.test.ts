import { Schema, Types } from "mongoose";
import { describe, expect, it, vi } from "vitest";
import {
	buildTenantFilter,
	enforceTenantIsolation,
	type TenantScopedQuery,
	tenantIsolationPlugin,
} from "../../src/models/plugins/tenant-isolation";

describe("tenant isolation query filter", () => {
	it("normalizes a string tenant id into an ObjectId client filter", () => {
		const clientId = "507f1f77bcf86cd799439011";
		const filter = buildTenantFilter(clientId);

		expect(filter.clientId).toBeInstanceOf(Types.ObjectId);
		expect(filter.clientId.toString()).toBe(clientId);
	});

	it("preserves an existing ObjectId tenant id", () => {
		const clientId = new Types.ObjectId();
		expect(buildTenantFilter(clientId)).toEqual({ clientId });
	});

	it("adds the tenant filter to queries with tenant isolation enabled", () => {
		const clientId = new Types.ObjectId();
		const where = vi.fn();
		const query = {
			getOptions: () => ({ tenantIsolationId: clientId }),
			where,
		} as TenantScopedQuery;

		enforceTenantIsolation.call(query);

		expect(where).toHaveBeenCalledWith({ clientId });
	});

	it("leaves ordinary queries unchanged", () => {
		const where = vi.fn();
		const query = {
			getOptions: () => ({}),
			where,
		} as TenantScopedQuery;

		enforceTenantIsolation.call(query);

		expect(where).not.toHaveBeenCalled();
	});

	it("registers isolation on every by-record query operation", () => {
		const schema = new Schema({ clientId: Schema.Types.ObjectId });
		const pre = vi.spyOn(schema, "pre");

		tenantIsolationPlugin(schema);

		expect(pre).toHaveBeenCalledTimes(5);
		expect(pre.mock.calls.map(([operation]) => operation)).toEqual([
			"find",
			"findOne",
			"findOneAndDelete",
			"findOneAndReplace",
			"findOneAndUpdate",
		]);
	});
});
