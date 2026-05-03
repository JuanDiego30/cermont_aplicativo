import type { DocumentDocument } from "@cermont/shared-types";
import type { SortDirection } from "../../_shared/common/interfaces/repository";
import type { IDocumentRepository } from "../domain/document.repository";
import { Document } from "./model";

export class DocumentRepository implements IDocumentRepository {
	async findById(id: string): Promise<DocumentDocument | null> {
		const doc = await Document.findById(id);
		return doc as unknown as DocumentDocument;
	}

	async findOne(filter: Record<string, unknown>): Promise<DocumentDocument | null> {
		const doc = await Document.findOne(filter);
		return doc as unknown as DocumentDocument;
	}

	async find(
		filter: Record<string, unknown>,
		options?: { skip?: number; limit?: number; sort?: Record<string, SortDirection> },
	): Promise<DocumentDocument[]> {
		let query = Document.find(filter);
		if (options?.sort) {
			query = query.sort(options.sort);
		}
		if (options?.skip) {
			query = query.skip(options.skip);
		}
		if (options?.limit) {
			query = query.limit(options.limit);
		}
		const docs = await query;
		return docs as unknown as DocumentDocument[];
	}

	async findLean(
		filter: Record<string, unknown>,
		sort?: Record<string, SortDirection>,
	): Promise<DocumentDocument[]> {
		let query = Document.find(filter);
		if (sort) {
			query = query.sort(sort);
		}
		const docs = await query.lean();
		return docs as unknown as DocumentDocument[];
	}

	async findByIdLean(id: string): Promise<DocumentDocument | null> {
		const doc = await Document.findById(id).lean();
		return doc as unknown as DocumentDocument;
	}

	async create(data: Partial<DocumentDocument>): Promise<DocumentDocument> {
		const doc = await Document.create(data as Record<string, unknown>);
		return doc as unknown as DocumentDocument;
	}

	async findByIdAndUpdate(
		id: string,
		update: Record<string, unknown>,
	): Promise<DocumentDocument | null> {
		const doc = await Document.findByIdAndUpdate(id, update, {
			returnDocument: "after",
		}).lean();
		return doc as unknown as DocumentDocument;
	}

	async findByIdAndDelete(id: string): Promise<DocumentDocument | null> {
		const doc = await Document.findByIdAndDelete(id).lean();
		return doc as unknown as DocumentDocument;
	}

	async update(id: string, data: Partial<DocumentDocument>): Promise<DocumentDocument | null> {
		const doc = await Document.findByIdAndUpdate(id, data, {
			returnDocument: "after",
			runValidators: true,
		});
		return doc as unknown as DocumentDocument;
	}

	async delete(id: string): Promise<boolean> {
		const result = await Document.findByIdAndDelete(id);
		return result !== null;
	}

	async countDocuments(filter: Record<string, unknown> = {}): Promise<number> {
		return Document.countDocuments(filter);
	}
}
