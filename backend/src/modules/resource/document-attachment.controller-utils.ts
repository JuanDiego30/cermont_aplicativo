import {
	CreateDocumentAttachmentSchema,
	type DocumentAttachment as DocumentAttachmentDto,
	type DocumentAttachmentEntityType,
} from "@cermont/shared-types";
import type { Request } from "express";
import { BadRequestError, NotFoundError } from "../../common/errors";
import { parseObjectId } from "../../common/utils/parseObjectId";
import { Document } from "../../models/Document";
import {
	DocumentAttachment,
	type IDocumentAttachmentDocument,
} from "../../models/DocumentAttachment";
import { associateDocument } from "../../modules/documents/document.service";

type LinkedDocumentEntityType = "asset" | "maintenance";

interface EntityAttachmentInput {
	documentId: string;
	entityType: DocumentAttachmentEntityType;
	entityId: string;
	label: string;
	type: DocumentAttachmentDto["type"];
	required: boolean;
	notes?: string;
}

interface EntityAttachmentConfig {
	entityType: DocumentAttachmentEntityType;
	linkedEntityType: LinkedDocumentEntityType;
	entityId: string;
	requestBody: Request["body"];
	userId: string;
}

function toAttachmentDto(attachment: IDocumentAttachmentDocument): DocumentAttachmentDto {
	const dto: DocumentAttachmentDto = {
		_id: attachment._id.toString(),
		documentId: attachment.documentId.toString(),
		entityType: attachment.entityType,
		entityId: attachment.entityId.toString(),
		label: attachment.label,
		type: attachment.type,
		required: attachment.required,
		createdAt: attachment.createdAt.toISOString(),
		createdBy: attachment.createdBy.toString(),
	};

	if (attachment.notes) {
		dto.notes = attachment.notes;
	}

	return dto;
}

function parseEntityAttachment(config: EntityAttachmentConfig): EntityAttachmentInput {
	const requestBody = config.requestBody as Partial<EntityAttachmentInput>;
	const parsed = CreateDocumentAttachmentSchema.safeParse({
		documentId: requestBody.documentId,
		entityType: config.entityType,
		entityId: config.entityId,
		label: requestBody.label,
		type: requestBody.type ?? "other",
		required: requestBody.required ?? false,
		notes: requestBody.notes,
	});

	if (!parsed.success) {
		throw new BadRequestError(
			"Invalid document attachment payload",
			"VALIDATION_ERROR",
			parsed.error.flatten(),
		);
	}

	return parsed.data;
}

function buildRequirementKey(
	entityType: DocumentAttachmentEntityType,
	attachmentId: string,
): string {
	return `document_attachment:${entityType}:${attachmentId}`;
}

async function assertDocumentExists(documentId: string): Promise<void> {
	const exists = await Document.exists({ _id: parseObjectId(documentId) });
	if (!exists) {
		throw new NotFoundError("Document", documentId);
	}
}

export async function upsertEntityDocumentAttachment(
	config: EntityAttachmentConfig,
): Promise<DocumentAttachmentDto> {
	const input = parseEntityAttachment(config);
	await assertDocumentExists(input.documentId);

	const documentObjectId = parseObjectId(input.documentId);
	const entityObjectId = parseObjectId(input.entityId);
	const userObjectId = parseObjectId(config.userId);
	const updateSet = {
		type: input.type,
		required: input.required,
		...(input.notes && { notes: input.notes }),
	};

	const attachment = await DocumentAttachment.findOneAndUpdate(
		{
			documentId: documentObjectId,
			entityType: input.entityType,
			entityId: entityObjectId,
			label: input.label,
		},
		{
			$set: updateSet,
			...(input.notes ? {} : { $unset: { notes: "" } }),
			$setOnInsert: {
				documentId: documentObjectId,
				entityType: input.entityType,
				entityId: entityObjectId,
				label: input.label,
				createdBy: userObjectId,
			},
		},
		{ returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
	).exec();

	if (!attachment) {
		throw new BadRequestError("Document attachment could not be persisted");
	}

	await associateDocument(
		input.documentId,
		{
			purpose: "support_document",
			linkedEntityType: config.linkedEntityType,
			linkedEntityId: input.entityId,
			requirementKey: buildRequirementKey(input.entityType, attachment._id.toString()),
		},
		config.userId,
	);

	return toAttachmentDto(attachment);
}

export async function listEntityDocumentAttachments(
	entityType: DocumentAttachmentEntityType,
	entityId: string,
): Promise<DocumentAttachmentDto[]> {
	const attachments = await DocumentAttachment.find({
		entityType,
		entityId: parseObjectId(entityId),
	})
		.sort({ createdAt: -1 })
		.exec();

	return attachments.map(toAttachmentDto);
}

export async function detachEntityDocumentAttachment(
	entityType: DocumentAttachmentEntityType,
	linkedEntityType: LinkedDocumentEntityType,
	entityId: string,
	documentId: string,
): Promise<{ message: string; detachedCount: number }> {
	const documentObjectId = parseObjectId(documentId);
	const entityObjectId = parseObjectId(entityId);
	const result = await DocumentAttachment.deleteMany({
		documentId: documentObjectId,
		entityType,
		entityId: entityObjectId,
	}).exec();

	if (result.deletedCount === 0) {
		throw new NotFoundError("Document attachment");
	}

	await Document.updateOne(
		{ _id: documentObjectId },
		{
			$pull: {
				associations: {
					linkedEntityType,
					linkedEntityId: entityObjectId,
				},
			},
		},
	).exec();

	return {
		message: "Document detached successfully",
		detachedCount: result.deletedCount,
	};
}
