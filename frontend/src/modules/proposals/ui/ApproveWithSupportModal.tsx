"use client";

import { apiClient } from "@/lib/http/api-client";
import type { Proposal } from "@cermont/shared-types";
import { X } from "lucide-react";
import { useState } from "react";

interface ApproveWithSupportModalProps {
	proposalId: string;
	onClose: () => void;
	onApproved: (proposal: Proposal) => void;
}

export function ApproveWithSupportModal({
	proposalId,
	onClose,
	onApproved,
}: ApproveWithSupportModalProps) {
	const [supportType, setSupportType] = useState<"verbal" | "email" | "document">("verbal");
	const [supportDescription, setSupportDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		if (supportDescription.trim().length < 10) {
			setError("La descripción del soporte debe tener al menos 10 caracteres");
			return;
		}
		setIsSubmitting(true);
		setError(null);
		try {
			const response = await apiClient.post<{
				success: true;
				data: { proposal: Proposal };
			}>(`/proposals/${proposalId}/approve-with-support`, {
				supportType,
				supportDescription: supportDescription.trim(),
			});
			onApproved(response.data.proposal);
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Error al aprobar con soporte";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
			role="dialog"
			aria-modal="true"
			aria-label="Aprobar propuesta con soporte"
		>
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						Aprobar con soporte
					</h2>
					<button
						type="button"
						onClick={onClose}
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
							<option value="verbal">Aprobación verbal</option>
							<option value="email">Confirmación por email</option>
							<option value="document">Documento escrito</option>
						</select>
					</div>

					<div>
						<label
							htmlFor="supportDescription"
							className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Descripción del soporte
						</label>
						<textarea
							id="supportDescription"
							value={supportDescription}
							onChange={(e) => setSupportDescription(e.target.value)}
							rows={4}
							minLength={10}
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#4CAF50] focus:outline-none focus:ring-1 focus:ring-[#4CAF50] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							placeholder="Describa el soporte de la aprobación (mín. 10 caracteres)..."
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
							onClick={onClose}
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
							{isSubmitting ? "Aprobando..." : "Confirmar aprobación"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
