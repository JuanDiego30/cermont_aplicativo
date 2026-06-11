"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
	Archive,
	Calendar,
	Download,
	FileCheck2,
	FileText,
	Link2,
	PenLine,
	ShieldCheck,
	Trash2,
	Workflow,
	X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import {
	type DocumentRecord,
	getDocumentAssociationCount,
	getDocumentLinkedEntityLabel,
	getDocumentProtectionReason,
	getDocumentPurposeLabel,
	getDocumentStepLabel,
	isProtectedDocument,
} from "../document-lifecycle";
import { useArchiveDocument, useDeleteDocument, useSignDocument } from "../queries";

interface DocumentGalleryProps {
	documents: DocumentRecord[];
}

type PendingActionKind = "archive" | "delete";

function formatSize(bytes?: number): string {
	if (typeof bytes !== "number") {
		return "Sin dato";
	}

	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateValue?: string): string {
	if (!dateValue) {
		return "Sin fecha";
	}

	try {
		return new Date(dateValue).toLocaleDateString("es-CO", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return dateValue;
	}
}

function getDocumentFileName(fileUrl: string): string {
	const fileSegments = fileUrl.split(/[/\\]/);
	return fileSegments[fileSegments.length - 1] || fileUrl;
}

function getDialogCopy(action: PendingActionKind, document: DocumentRecord) {
	const protectionReason = getDocumentProtectionReason(document);

	if (action === "archive") {
		return {
			confirmLabel: "Archivar",
			description: protectionReason
				? `Removed from active work. 5-year retention remains. Protection basis: ${protectionReason}.`
				: "Removed from active work. 5-year retention remains for audit.",
			title: "Archivar documento",
		};
	}

	if (protectionReason) {
		return {
			confirmLabel: "Archivar por retencion",
			description:
				`Protected by closeout traceability: ${protectionReason}. ` +
				"The request archives it with retention instead of deleting the physical file.",
			title: "Retirar documento protegido",
		};
	}

	return {
		confirmLabel: "Eliminar",
		description: "Deletes the record and physical file when no critical closeout links exist.",
		title: "Eliminar documento",
	};
}

function ActionDialog({
	action,
	document,
	isPending,
	onClose,
	onConfirm,
	open,
}: {
	action: PendingActionKind;
	document: DocumentRecord;
	isPending: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	open: boolean;
}) {
	const [reason, setReason] = useState("");
	const dialogCopy = getDialogCopy(action, document);
	const handleClose = () => {
		setReason("");
		onClose();
	};

	if (!open) {
		return null;
	}

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					handleClose();
				}
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
				<Dialog.Content
					aria-labelledby="document-gallery-dialog-title"
					className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<Dialog.Title
								id="document-gallery-dialog-title"
								className="text-lg font-semibold text-[var(--text-primary)]"
							>
								{dialogCopy.title}
							</Dialog.Title>
							<Dialog.Description className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
								{dialogCopy.description}
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="size-9 rounded-full"
								aria-label="Cerrar dialogo de documento"
								onClick={handleClose}
							>
								<X className="size-4" aria-hidden="true" />
							</Button>
						</Dialog.Close>
					</div>
					<label
						htmlFor="documents-action-reason"
						className="mt-4 block text-sm font-medium text-[var(--text-primary)]"
					>
						Motivo (opcional)
					</label>
					<input
						id="documents-action-reason"
						type="text"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						placeholder="Ej: documento duplicado o reemplazado"
						className="mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
					/>
					<div className="mt-5 flex justify-end gap-3">
						<Button type="button" variant="secondary" onClick={handleClose}>
							Cancelar
						</Button>
						<Button
							type="button"
							onClick={() => onConfirm(reason.trim())}
							loading={isPending}
							variant={action === "archive" ? "accent" : "destructive"}
						>
							{dialogCopy.confirmLabel}
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export function DocumentGallery({ documents }: DocumentGalleryProps) {
	const [pendingActionDocId, setPendingActionDocId] = useState("");
	const [pendingActionKind, setPendingActionKind] = useState<PendingActionKind>("archive");

	const archiveMutation = useArchiveDocument();
	const deleteMutation = useDeleteDocument();
	const signMutation = useSignDocument();

	if (!documents.length) {
		return (
			<div className="flex min-h-40 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border-default)]">
				<p className="text-sm text-[var(--text-tertiary)]">Sin documentos</p>
			</div>
		);
	}

	const isDialogOpen = pendingActionDocId.length > 0;
	const activeDocument =
		(isDialogOpen && documents.find((document) => document._id === pendingActionDocId)) || false;

	const closeDialog = () => {
		setPendingActionDocId("");
		setPendingActionKind("archive");
	};

	const handleArchive = (reason: string) => {
		if (!pendingActionDocId) {
			return;
		}

		archiveMutation.mutate(
			{ id: pendingActionDocId, reason: reason || void 0 },
			{ onSettled: closeDialog },
		);
	};

	const handleDelete = (reason: string) => {
		if (!pendingActionDocId) {
			return;
		}

		deleteMutation.mutate(
			{ id: pendingActionDocId, reason: reason || void 0 },
			{ onSettled: closeDialog },
		);
	};

	return (
		<section aria-label="Galeria de documentos">
			<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{documents.map((document) => {
					const isArchived = document.lifecycleStatus === "archived";
					const isDeleted = document.lifecycleStatus === "deleted";
					const isProtected = isProtectedDocument(document);
					const purposeLabel = getDocumentPurposeLabel(document);
					const stepLabel = getDocumentStepLabel(document);
					const linkedEntityLabel = getDocumentLinkedEntityLabel(document);
					const associationCount = getDocumentAssociationCount(document);
					const protectionReason = getDocumentProtectionReason(document);
					const hasPendingMutation =
						archiveMutation.isPending || deleteMutation.isPending || signMutation.isPending;

					return (
						<li key={document._id}>
							<article
								className={`flex h-full flex-col justify-between rounded-xl border bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-2)] ${
									isArchived
										? "border-amber-300 dark:border-amber-700"
										: isDeleted
											? "border-red-300 opacity-60 dark:border-red-700"
											: isProtected
												? "border-blue-300 dark:border-blue-700"
												: "border-[var(--border-default)]"
								}`}
							>
								<div>
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 items-start gap-3">
											<FileText
												className="mt-0.5 size-5 shrink-0 text-[var(--color-brand)]"
												aria-hidden="true"
											/>
											<div className="min-w-0 flex-1">
												<h3 className="truncate text-sm font-medium text-[var(--text-primary)]">
													{document.title}
												</h3>
												<p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
													{getDocumentFileName(document.file_url)}
												</p>
												<p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
													{document.file_url}
												</p>
											</div>
										</div>

										<div className="flex shrink-0 flex-col items-end gap-1">
											{isArchived && (
												<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
													<Archive className="size-3" aria-hidden="true" />
													Archivado
												</span>
											)}
											{isDeleted && (
												<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
													Eliminado
												</span>
											)}
											{!isArchived && !isDeleted && isProtected && (
												<span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--color-brand)]">
													<ShieldCheck className="size-3" aria-hidden="true" />
													Protegido
												</span>
											)}
											{document.signed && !isArchived && !isDeleted && (
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
													<FileCheck2 className="size-3" aria-hidden="true" />
													Firmado
												</span>
											)}
										</div>
									</div>

									<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
										<span className="rounded-full bg-[var(--surface-secondary)] px-2 py-0.5">
											{purposeLabel}
										</span>
										{document.mime_type && (
											<span className="rounded-full bg-[var(--surface-secondary)] px-2 py-0.5">
												{document.mime_type}
											</span>
										)}
										{stepLabel && (
											<span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-secondary)] px-2 py-0.5">
												<Workflow className="size-3" aria-hidden="true" />
												{stepLabel}
											</span>
										)}
										{linkedEntityLabel && (
											<span className="rounded-full bg-[var(--surface-secondary)] px-2 py-0.5">
												{linkedEntityLabel}
											</span>
										)}
										{associationCount > 0 && (
											<span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-secondary)] px-2 py-0.5">
												<Link2 className="size-3" aria-hidden="true" />
												{associationCount} vinculo(s)
											</span>
										)}
										<span>{formatSize(document.file_size)}</span>
										{document.order_id && (
											<span className="font-mono text-[11px]">OT {document.order_id}</span>
										)}
									</div>

									{isProtected && !isArchived && !isDeleted && (
										<div className="mt-3 rounded-lg border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 p-3 text-xs leading-5 text-[var(--text-secondary)]">
											<p className="font-medium">Closeout protection</p>
											<p>{protectionReason}</p>
										</div>
									)}

									{isArchived && (
										<div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
											<p className="font-medium">Archivado el {formatDate(document.archivedAt)}</p>
											{document.retentionUntil && (
												<p>Retencion hasta {formatDate(document.retentionUntil)}</p>
											)}
											{document.archiveReason && <p>Motivo: {document.archiveReason}</p>}
										</div>
									)}
								</div>

								<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
									<span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
										<Calendar className="size-3" aria-hidden="true" />
										Creado {formatDate(document.createdAt)}
									</span>

									<div className="flex items-center gap-1">
										{!isArchived && !isDeleted && (
											<>
												{!document.signed && (
													<button
														type="button"
														onClick={() => signMutation.mutate({ id: document._id })}
														disabled={hasPendingMutation}
														aria-label="Firmar documento"
														title="Firmar"
														className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
													>
														<PenLine className="size-3" aria-hidden="true" />
														Firmar
													</button>
												)}

												<button
													type="button"
													onClick={() => {
														setPendingActionDocId(document._id);
														setPendingActionKind("archive");
													}}
													disabled={hasPendingMutation}
													aria-label="Archivar documento"
													title="Archivar"
													className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-amber-600 transition-colors hover:bg-amber-50 disabled:opacity-50"
												>
													<Archive className="size-3" aria-hidden="true" />
													Archivar
												</button>

												<button
													type="button"
													onClick={() => {
														setPendingActionDocId(document._id);
														setPendingActionKind("delete");
													}}
													disabled={hasPendingMutation}
													aria-label="Eliminar documento"
													title={isProtected ? "Retirar con retencion" : "Eliminar"}
													className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
												>
													<Trash2 className="size-3" aria-hidden="true" />
													{isProtected ? "Retirar" : "Eliminar"}
												</button>
											</>
										)}

										{document.order_id && !isDeleted && (
											<Link
												href={`/orders/${document.order_id}`}
												className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--color-brand)]"
											>
												Ver orden
											</Link>
										)}
										{document.file_url && !isDeleted && (
											<Link
												href={document.file_url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/10"
											>
												<Download className="size-3" aria-hidden="true" />
												Descargar
											</Link>
										)}
									</div>
								</div>
							</article>
						</li>
					);
				})}
			</ul>

			{activeDocument ? (
				<ActionDialog
					action={pendingActionKind}
					document={activeDocument}
					open={isDialogOpen}
					isPending={
						pendingActionKind === "archive" ? archiveMutation.isPending : deleteMutation.isPending
					}
					onClose={closeDialog}
					onConfirm={pendingActionKind === "archive" ? handleArchive : handleDelete}
				/>
			) : null}
		</section>
	);
}
