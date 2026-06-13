import { type Query, type QueryOptions, type Schema, Types } from "mongoose";

export interface TenantIsolationQueryOptions extends QueryOptions {
	tenantIsolationId?: string | Types.ObjectId;
}

export type TenantScopedQuery = Query<object, object, Record<string, never>, object, "find">;

export function buildTenantFilter(tenantIsolationId: string | Types.ObjectId): {
	clientId: Types.ObjectId;
} {
	return {
		clientId:
			tenantIsolationId instanceof Types.ObjectId
				? tenantIsolationId
				: new Types.ObjectId(tenantIsolationId),
	};
}

export function enforceTenantIsolation(this: TenantScopedQuery): void {
	const options = this.getOptions() as TenantIsolationQueryOptions;
	if (!options.tenantIsolationId) {
		return;
	}

	this.where(buildTenantFilter(options.tenantIsolationId));
}

export function tenantIsolationPlugin(schema: Schema): void {
	schema.pre("find", enforceTenantIsolation);
	schema.pre("findOne", enforceTenantIsolation);
	schema.pre("findOneAndDelete", enforceTenantIsolation);
	schema.pre("findOneAndReplace", enforceTenantIsolation);
	schema.pre("findOneAndUpdate", enforceTenantIsolation);
}
