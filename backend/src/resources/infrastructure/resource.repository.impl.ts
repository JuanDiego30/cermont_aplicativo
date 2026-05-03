import type { ResourceDocument } from "@cermont/shared-types";
import type { IResourceRepository } from "../domain/resource.repository";
import { Resource } from "./model";

export class ResourceRepository implements IResourceRepository {
	async create(data: Partial<ResourceDocument>): Promise<ResourceDocument> {
		const doc = await Resource.create(data);
		return doc as unknown as ResourceDocument;
	}

	async findById(id: string): Promise<ResourceDocument | null> {
		const doc = await Resource.findById(id);
		return doc as unknown as ResourceDocument;
	}

	async findByIdLean(id: string): Promise<ResourceDocument | null> {
		const doc = await Resource.findById(id).lean();
		return doc as unknown as ResourceDocument;
	}

	async findAll(
		filters: Record<string, unknown>,
		page: number = 1,
		limit: number = 50,
	): Promise<{ data: ResourceDocument[]; total: number }> {
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			Resource.find(filters).sort({ createdAt: -1 }).limit(limit).skip(skip).lean(),
			Resource.countDocuments(filters),
		]);
		return { data: data as unknown as ResourceDocument[], total };
	}

	async save(resource: ResourceDocument): Promise<ResourceDocument> {
		if (typeof (resource as { save?: unknown }).save === "function") {
			return (resource as ResourceDocument & { save(): Promise<ResourceDocument> }).save();
		}
		const doc = await Resource.findById(
			(resource as { _id: { toString(): string } })._id.toString(),
		);
		if (!doc) {
			throw new Error("Document not found for saving");
		}
		Object.assign(doc, resource);
		return doc.save() as unknown as ResourceDocument;
	}

	async deleteById(id: string): Promise<void> {
		await Resource.findByIdAndDelete(id);
	}

	async countDocuments(filters: Record<string, unknown>): Promise<number> {
		return Resource.countDocuments(filters);
	}
}
