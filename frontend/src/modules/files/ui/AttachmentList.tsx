"use client";

/**
 * AttachmentList — Display + delete list of FileAssets for an entity
 *
 * Shows the file assets owned by a specific entity (kit, tool, evidence,
 * delivery record, etc.) with:
 *   - Loading skeleton
 *   - Error state with retry
 *   - Empty state with helpful message
 *   - Each file as a card with: thumbnail/icon, original name, size, date
 *   - Delete button per file (RBAC-aware via parent permission check)
 *   - Click to open the public URL in a new tab
 *
 * This component is purely presentational + TanStack Query. No business
 * logic. RBAC enforcement happens server-side; the client only hides
 * the delete button if the parent says so.
 */

import type { FileAssetCategory, FileAssetEntityType, FileAssetRef } from "@cermont/shared-types";
import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { Button } from "@/core/ui/Button";
import { useDeleteFile, useFilesByEntity } from "../hooks/useFileAssets";

export interface AttachmentListProps {
	entityType: FileAssetEntityType;
	entityId: string;
	category?: FileAssetCategory;
	canDelete?: boolean;
	onDeleted?: (id: string) => void;
	emptyMessage?: string;
	className?: string;
}

function formatSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString("es-CO", {
			dateStyle: "short",
			timeStyle: "short",
		});
	} catch {
		return iso;
	}
}

function isImage(mimeType: string): boolean {
	return mimeType.startsWith("image/");
}

function FileIcon({ mimeType }: { mimeType: string }) {
	if (isImage(mimeType)) {
		return <ImageIcon className="h-5 w-5 text-cermont-blue" aria-hidden="true" />;
	}
	return <FileText className="h-5 w-5 text-cermont-blue" aria-hidden="true" />;
}

function FileCard({
	asset,
	canDelete,
	onDelete,
}: {
	asset: FileAssetRef;
	canDelete: boolean;
	onDelete: (id: string) => void;
}) {
	return (
		<li className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas p-3">
			{isImage(asset.mimeType) ? (
				<Image
					src={asset.thumbnailUrl ?? asset.url}
					alt={asset.originalName}
					width={48}
					height={48}
					className="h-12 w-12 rounded-lg object-cover"
					unoptimized
				/>
			) : (
				<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info-bg">
					<FileIcon mimeType={asset.mimeType} />
				</div>
			)}

			<div className="min-w-0 flex-1">
				<a
					href={asset.url}
					target="_blank"
					rel="noopener noreferrer"
					className="block truncate text-sm font-medium text-ink hover:text-cermont-blue"
				>
					{asset.originalName}
				</a>
				<p className="text-xs text-steel">
					{formatSize(asset.sizeBytes)} · {formatDate(asset.uploadedAt)}
				</p>
			</div>

			{canDelete ? (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => onDelete(asset.id)}
					aria-label={`Eliminar ${asset.originalName}`}
				>
					<Trash2 className="h-4 w-4 text-brand-error" />
				</Button>
			) : null}
		</li>
	);
}

export function AttachmentList({
	entityType,
	entityId,
	category,
	canDelete = true,
	onDeleted,
	emptyMessage = "No hay archivos adjuntos todavía.",
	className = "",
}: AttachmentListProps) {
	const { data, isLoading, isError, error, refetch } = useFilesByEntity({
		entityType,
		entityId,
		category,
	});

	const deleteMutation = useDeleteFile();

	const sorted = useMemo(() => {
		if (!data) {
			return [];
		}
		return data.toSorted((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
	}, [data]);

	const handleDelete = async (id: string) => {
		try {
			await deleteMutation.mutateAsync({ id, entityType, entityId });
			onDeleted?.(id);
		} catch {
			// Error is surfaced via the mutation; the list will re-sync on next refetch
		}
	};

	if (isLoading) {
		return (
			<div className={`flex flex-col gap-2 ${className}`} aria-busy="true" aria-live="polite">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="h-16 animate-pulse rounded-xl border border-hairline bg-surface"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div
				className={`rounded-xl border border-red-200 bg-danger-bg p-4 text-sm text-brand-error ${className}`}
				role="alert"
			>
				<p className="font-medium">No se pudieron cargar los archivos.</p>
				<p className="text-xs">{error instanceof Error ? error.message : "Error desconocido."}</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="mt-2"
					onClick={() => void refetch()}
				>
					Reintentar
				</Button>
			</div>
		);
	}

	if (sorted.length === 0) {
		return (
			<div
				className={`rounded-xl border border-dashed border-hairline bg-canvas p-6 text-center text-sm text-steel ${className}`}
			>
				{emptyMessage}
			</div>
		);
	}

	return (
		<ul className={`flex flex-col gap-2 ${className}`} aria-label="Archivos adjuntos">
			{sorted.map((asset) => (
				<FileCard key={asset.id} asset={asset} canDelete={canDelete} onDelete={handleDelete} />
			))}
		</ul>
	);
}
