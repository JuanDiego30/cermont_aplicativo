import type { ResourceDocument } from "@cermont/shared-types";

export interface IResourceRepository {
	create(data: Partial<ResourceDocument>): Promise<ResourceDocument>;
	findById(id: string): Promise<ResourceDocument | null>;
	findByIdLean(id: string): Promise<ResourceDocument | null>;
	findAll(
		filters: Record<string, unknown>,
		page?: number,
		limit?: number,
	): Promise<{ data: ResourceDocument[]; total: number }>;
	save(resource: ResourceDocument): Promise<ResourceDocument>;
	deleteById(id: string): Promise<void>;
	countDocuments(filters: Record<string, unknown>): Promise<number>;
}
