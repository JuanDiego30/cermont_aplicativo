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
	getDocumentAssociationCount,
	getDocumentLinkedEntityLabel,
	getDocumentProtectionReason,
	getDocumentPurposeLabel,
	getDocumentStepLabel,
	isProtectedDocument,
	type DocumentRecord,
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
		description:
			"Deletes the record and physical file when no critical closeout links exist.",
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
				<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
					<div className="flex items-start justify-between gap-4">
						<div>
							<Dialog.Title className="text-lg font-semibold text-zinc-900">
								{dialogCopy.title}
							</Dialog.Title>
							<Dialog.Description className="mt-2 text-sm leading-6 text-zinc-600">
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
					className="mt-4 block text-sm font-medium text-zinc-700"
				>
					Motivo (opcional)
				</label>
				<input
					id="documents-action-reason"
					type="text"
					value={reason}
					onChange={(event) => setReason(event.target.value)}
					placeholder="Ej: documento duplicado o reemplazado"
					className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
				<div className="mt-5 flex justify-end gap-3">
					<Button
						type="button"
						variant="secondary"
						onClick={handleClose}
					>
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
			<div className="flex min-h-40 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
				<p className="text-sm text-zinc-400">Sin documentos</p>
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
								className={`flex h-full flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-950 ${
									isArchived
										? "border-amber-200 dark:border-amber-800"
										: isDeleted
											? "border-red-200 opacity-60 dark:border-red-800"
											: isProtected
												? "border-blue-200 dark:border-blue-800"
												: "border-zinc-200 dark:border-zinc-800"
								}`}
							>
								<div>
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 items-start gap-3">
											<FileText
												className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
												aria-hidden="true"
											/>
											<div className="min-w-0 flex-1">
												<h3 className="truncate text-sm font-medium text-zinc-900 dark:text-white">
													{document.title}
												</h3>
												<p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
													{getDocumentFileName(document.file_url)}
												</p>
												<p className="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">
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
												<span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
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

									<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
										<span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
											{purposeLabel}
										</span>
										{document.mime_type && (
											<span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
												{document.mime_type}
											</span>
										)}
										{stepLabel && (
											<span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
												<Workflow className="size-3" aria-hidden="true" />
												{stepLabel}
											</span>
										)}
										{linkedEntityLabel && (
											<span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
												{linkedEntityLabel}
											</span>
										)}
										{associationCount > 0 && (
											<span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
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
										<div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs leading-5 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-200">
											<p className="font-medium">Closeout protection</p>
											<p>{protectionReason}</p>
										</div>
									)}

									{isArchived && (
										<div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
											<p className="font-medium">
												Archivado el {formatDate(document.archivedAt)}
											</p>
											{document.retentionUntil && (
												<p>Retencion hasta {formatDate(document.retentionUntil)}</p>
											)}
											{document.archiveReason && <p>Motivo: {document.archiveReason}</p>}
										</div>
									)}
								</div>

								<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
									<span className="flex items-center gap-1 text-xs text-zinc-400">
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
												className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:text-blue-600"
											>
												Ver orden
											</Link>
										)}
										{document.file_url && !isDeleted && (
											<Link
												href={document.file_url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
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
					isPending={pendingActionKind === "archive" ? archiveMutation.isPending : deleteMutation.isPending}
					onClose={closeDialog}
					onConfirm={pendingActionKind === "archive" ? handleArchive : handleDelete}
				/>
			) : null}
		</section>
	);
}
