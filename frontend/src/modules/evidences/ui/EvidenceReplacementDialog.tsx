"use client";

/**
 * EvidenceReplacementDialog — Upload a replacement for rejected evidence.
 *
 * Uses the existing POST /evidences/:id/replace endpoint.
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";

interface EvidenceReplacementDialogProps {
	evidenceId: string;
	evidenceName: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function EvidenceReplacementDialog({
	evidenceId,
	evidenceName,
}: EvidenceReplacementDialogProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [dragOver, setDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const replaceMutation = useMutation({
		mutationFn: async () => {
			if (!file) {
				throw new Error("Seleccione un archivo");
			}
			const formData = new FormData();
			formData.append("file", file);
			const res = await apiClient.post<{ success: boolean }>(
				`/evidences/${evidenceId}/replace`,
				formData,
			);
			if (!res.success) {
				throw new Error("Error al reemplazar evidencia");
			}
		},
		onSuccess: () => {
			toast.success("Evidencia reemplazada exitosamente");
			queryClient.invalidateQueries({ queryKey: ["evidence"] });
			queryClient.invalidateQueries({ queryKey: ["evidences"] });
			setOpen(false);
			setFile(null);
		},
		onError: (err: Error) => {
			toast.error("No se pudo reemplazar la evidencia", {
				description: err.message,
			});
		},
	});

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const dropped = e.dataTransfer.files[0];
		if (dropped && ACCEPTED_TYPES.includes(dropped.type)) {
			setFile(dropped);
		} else {
			toast.error("Tipo de archivo no soportado");
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] px-4 py-2 text-xs font-semibold text-[var(--color-brand)] transition hover:bg-[var(--surface-primary)]"
				>
					<RotateCcw className="size-3.5" aria-hidden="true" />
					Reemplazar evidencia
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
				<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] bg-[var(--surface-primary)] p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out">
					<Dialog.Close asChild>
						<button
							type="button"
							className="absolute right-4 top-4 rounded-full p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							aria-label="Cerrar"
						>
							<X className="size-4" />
						</button>
					</Dialog.Close>

					<Dialog.Title className="text-lg font-bold text-[var(--text-primary)]">
						Reemplazar evidencia
					</Dialog.Title>
					<Dialog.Description className="mt-2 text-sm text-[var(--text-secondary)]">
						Sube una nueva versión de &ldquo;{evidenceName}&rdquo;. La evidencia anterior quedará
						reemplazada.
					</Dialog.Description>

					<label
						className={`mt-6 block cursor-pointer rounded-[var(--radius-md)] border-2 border-dashed p-8 text-center transition ${
							dragOver
								? "border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)]"
								: "border-[var(--border-default)] bg-[var(--surface-secondary)]"
						}`}
						onDragOver={(e) => {
							e.preventDefault();
							setDragOver(true);
						}}
						onDragLeave={() => setDragOver(false)}
						onDrop={handleDrop}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept={ACCEPTED_TYPES.join(",")}
							className="hidden"
							onChange={(e) => {
								const selected = e.target.files?.[0];
								if (selected) {
									setFile(selected);
								}
							}}
						/>
						<Upload className="mx-auto size-8 text-[var(--text-muted)]" aria-hidden="true" />
						<p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
							{file ? file.name : "Arrastra un archivo o haz clic para seleccionar"}
						</p>
						<p className="mt-1 text-[10px] text-[var(--text-muted)]">
							JPEG, PNG, WEBP o PDF — máx. 10 MB
						</p>
					</label>

					<div className="mt-6 flex justify-end gap-3">
						<Dialog.Close asChild>
							<button
								type="button"
								className="rounded-full border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
							>
								Cancelar
							</button>
						</Dialog.Close>
						<button
							type="button"
							disabled={!file || replaceMutation.isPending}
							onClick={() => replaceMutation.mutate()}
							className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{replaceMutation.isPending ? (
								<>
									<Loader2 className="size-4 animate-spin" aria-hidden="true" />
									Subiendo…
								</>
							) : (
								"Subir reemplazo"
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
