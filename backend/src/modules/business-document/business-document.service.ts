/**
 * BusinessDocumentService — Business logic for business document templates
 */
import type {
	CreateBusinessDocumentInput,
	UpdateBusinessDocumentInput,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors/AppError";
import { BusinessDocument } from "../../models/BusinessDocument";

export class BusinessDocumentService {
	async list(documentType?: string) {
		const filter: Record<string, unknown> = { lifecycleStatus: "active" };
		if (documentType) {
			filter.documentType = documentType;
		}
		return BusinessDocument.find(filter).sort({ createdAt: -1 }).exec();
	}

	async create(data: CreateBusinessDocumentInput) {
		return BusinessDocument.create(data);
	}

	async getById(id: string) {
		const doc = await BusinessDocument.findOne({ _id: id, lifecycleStatus: "active" }).exec();
		if (!doc) {
			throw new AppError("Business document not found", 404, "BUSINESS_DOCUMENT_NOT_FOUND");
		}
		return doc;
	}

	async update(id: string, data: UpdateBusinessDocumentInput) {
		const doc = await BusinessDocument.findOneAndUpdate(
			{ _id: id, lifecycleStatus: "active" },
			{ $set: data },
			{ returnDocument: "after" },
		).exec();
		if (!doc) {
			throw new AppError("Business document not found", 404, "BUSINESS_DOCUMENT_NOT_FOUND");
		}
		return doc;
	}

	async delete(id: string) {
		const result = await BusinessDocument.findOneAndUpdate(
			{ _id: id, lifecycleStatus: "active" },
			{ $set: { lifecycleStatus: "deleted" } },
		).exec();
		if (!result) {
			throw new AppError("Business document not found", 404, "BUSINESS_DOCUMENT_NOT_FOUND");
		}
		return true;
	}
}

export const businessDocumentService = new BusinessDocumentService();
