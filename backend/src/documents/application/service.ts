/**
 * Document Service for Cermont Backend
 *
 * Handles document management business logic:
 * - CRUD operations for documents
 * - File cleanup on errors
 * - Document signing
 *
 * FIX: Use Repository Pattern instead of direct model access
 * FIX: Strong typing with DocumentDocument from shared-types
 */

import fs from "node:fs/promises";
import type {
	DocumentCategory,
	DocumentDocument,
	DocumentPhase,
	OrderStatus,
} from "@cermont/shared-types";
import { AppError } from "../../_shared/common/errors";
import { createLogger, parseObjectId } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";

const log = createLogger("document-service");

function deriveDocumentPhase(status: OrderStatus | string | undefined): DocumentPhase {
	if (status === "in_progress" || status === "on_hold") {
		return "execution";
	}
	if (status === "completed" || status === "ready_for_invoicing" || status === "closed") {
		return "closure";
	}
	return "planning";
}

export const DocumentService = {
	/**
	 * Create a new document record
	 */
	async create(
		data: { title: string; category: DocumentCategory; orderId?: string; phase?: DocumentPhase },
		filePath: string,
		userId: string,
	): Promise<DocumentDocument> {
		const order = data.orderId ? await container.orderRepository.findByIdLean(data.orderId) : null;
		const payload = {
			title: data.title,
			category: data.category,
			file_url: filePath,
			uploaded_by: parseObjectId(userId).toString(),
			phase: data.phase ?? deriveDocumentPhase(order?.status),
			...(data.orderId ? { order_id: parseObjectId(data.orderId).toString() } : {}),
		};

		const document = await container.documentRepository.create(payload);

		log.info("Document created", {
			documentId: String(document._id),
			title: data.title,
		});
		return document;
	},

	/**
	 * Get all documents (paginated)
	 */
	async findAll(
		filters?: { orderId?: string; category?: string; phase?: string },
		page = 1,
		limit = 20,
	): Promise<{
		data: DocumentDocument[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
		const query: Record<string, unknown> = {};

		if (filters?.orderId) {
			query.order_id = filters.orderId;
		}
		if (filters?.category) {
			query.category = filters.category;
		}
		if (filters?.phase) {
			query.phase = filters.phase;
		}

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			container.documentRepository.find(query, {
				skip,
				limit,
				sort: { createdAt: -1 },
			}),
			container.documentRepository.countDocuments(query),
		]);

		return {
			data,
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		};
	},

	/**
	 * Delete a document (with file cleanup)
	 */
	async delete(id: string): Promise<void> {
		const document = await container.documentRepository.findByIdLean(id);
		if (!document) {
			throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
		}

		// Delete physical file if exists
		if (document.file_url) {
			try {
				await fs.unlink(document.file_url);
			} catch (err) {
				log.warn("Failed to delete physical file", {
					fileUrl: document.file_url,
					error: (err as Error).message,
				});
			}
		}

		await container.documentRepository.findByIdAndDelete(id);
		log.info("Document deleted", { documentId: id });
	},

	/**
	 * Sign a document
	 */
	async sign(id: string, userId: string): Promise<DocumentDocument> {
		const document = await container.documentRepository.findByIdAndUpdate(id, {
			signed: true,
			signedBy: userId,
			signedAt: new Date(),
		});

		if (!document) {
			throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
		}

		log.info("Document signed", { documentId: id, signedBy: userId });
		return document;
	},

	/**
	 * Clean up uploaded file on error
	 */
	async cleanupFile(filePath: string): Promise<void> {
		try {
			await fs.unlink(filePath);
		} catch {
			// Ignore cleanup errors
		}
	},
};
