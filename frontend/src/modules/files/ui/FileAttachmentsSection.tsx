"use client";

/**
 * FileAttachmentsSection — Reusable file/photo attachments panel
 *
 * Composes:
 *   - OfflineUploadQueueStatus (shows pending sync state)
 *   - FileUploadField (drag-and-drop + camera capture)
 *   - AttachmentList (display + delete)
 *
 * Designed to be dropped into any detail page that owns a
 * `FileAssetEntityType` + entityId. Renders loading/error/empty states
 * inherited from the underlying components.
 *
 * Usage:
 *   <FileAttachmentsSection
 *     entityType="delivery_record"
 *     entityId={record._id}
 *     category="delivery_record_attachment"
 *     canDelete={canEdit}
 *   />
 */

import type { FileAssetCategory, FileAssetEntityType } from "@cermont/shared-types";

import { AttachmentList } from "./AttachmentList";
import { FileUploadField } from "./FileUploadField";
import { ImageUploadField } from "./ImageUploadField";
import { OfflineUploadQueueStatus } from "./OfflineUploadQueueStatus";

export interface FileAttachmentsSectionProps {
	entityType: FileAssetEntityType;
	entityId: string;
	category: FileAssetCategory;
	imagesOnly?: boolean;
	title?: string;
	description?: string;
	canUpload?: boolean;
	canDelete?: boolean;
	className?: string;
}

export function FileAttachmentsSection({
	entityType,
	entityId,
	category,
	imagesOnly = false,
	title = "Archivos adjuntos",
	description,
	canUpload = true,
	canDelete = true,
	className = "",
}: FileAttachmentsSectionProps) {
	return (
		<section
			aria-labelledby="file-attachments-title"
			className={`space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 ${className}`}
		>
			<header className="space-y-1">
				<h3
					id="file-attachments-title"
					className="text-base font-semibold text-[var(--text-primary)]"
				>
					{title}
				</h3>
				{description ? <p className="text-xs text-[var(--text-secondary)]">{description}</p> : null}
			</header>

			<OfflineUploadQueueStatus entityHint={title} />

			{canUpload ? (
				<div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-4">
					{imagesOnly ? (
						<ImageUploadField entityType={entityType} entityId={entityId} category={category} />
					) : (
						<FileUploadField entityType={entityType} entityId={entityId} category={category} />
					)}
				</div>
			) : null}

			<AttachmentList
				entityType={entityType}
				entityId={entityId}
				category={category}
				canDelete={canDelete}
			/>
		</section>
	);
}
