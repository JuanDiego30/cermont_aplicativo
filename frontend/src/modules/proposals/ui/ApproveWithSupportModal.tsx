"use client";

import { apiClient } from "@/lib/http/api-client";
import type { Proposal } from "@cermont/shared-types";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ApproveWithSupportModalProps {
	proposalId: string;
	open: boolean;
	onClose: () => void;
	onApproved: (proposal: Proposal) => void;
}

export function ApproveWithSupportModal({
	proposalId,
	open,
	onClose,
	onApproved,
}: ApproveWithSupportModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [supportType, setSupportType] = useState<"verbal" | "email" | "document">("verbal");
	const [supportDescription, setSupportDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string>("");

	const handleClose = useCallback(() => {
		dialogRef.current?.close();
		onClose();
	}, [onClose]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		const handleNativeClose = () => {
			onClose();
		};
		dialog.addEventListener("close", handleNativeClose);
		return () => dialog.removeEventListener("close", handleNativeClose);
	}, [onClose]);

	const handleSubmit = async () => {
		if (supportDescription.trim().length < 10) {
			setError("La descripcion del soporte debe tener al menos 10 caracteres");
			return;
		}
		setIsSubmitting(true);
		setError("");
		try {
			const response = await apiClient.post<{
				success: true;
				data: { proposal: Proposal };
			}>(`/proposals/${proposalId}/approve-with-support`, {
				supportType,
				supportDescription: supportDescription.trim(),
			});
			onApproved(response.data.proposal);
			handleClose();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Error al aprobar con soporte");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<dialog
			ref={dialogRef}
			className="rounded-2xl border border-[var(--border-subtle)] bg-white p-0 shadow-xl backdrop:bg-black/40 dark:bg-gray-800"
		>
			<div className="w-full max-w-md p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						Aprobar con soporte
					</h2>
					<button
						type="button"
						onClick={handleClose}
						className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
						aria-label="Cerrar"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="supportType"
							className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Tipo de soporte
						</label>
						<select
							id="supportType"
							value={supportType}
							onChange={(e) =>
								setSupportType(e.target.value as "verbal" | "email" | "document")
							}
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							<option value="verbal">Aprobacion verbal</option>
							<option value="email">Confirmacion por email</option>
							<option value="document">Documento escrito</option>
						</select>
					</div>

					<div>
						<label
							htmlFor="supportDescription"
							className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Descripcion del soporte
						</label>
						<textarea
							id="supportDescription"
							value={supportDescription}
							onChange={(e) => setSupportDescription(e.target.value)}
							rows={4}
							minLength={10}
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							placeholder="Describa el soporte de la aprobacion (min. 10 caracteres)..."
						/>
					</div>

					{error && (
						<p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</p>
					)}

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={handleClose}
							className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
							disabled={isSubmitting}
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSubmitting}
							className="rounded-full bg-[#2154A6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a4390] disabled:opacity-50"
						>
							{isSubmitting ? "Aprobando..." : "Confirmar aprobacion"}
						</button>
					</div>
				</div>
			</div>
		</dialog>
	);
}
