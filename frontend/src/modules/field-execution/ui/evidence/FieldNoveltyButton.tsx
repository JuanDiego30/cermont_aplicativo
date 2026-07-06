"use client";

import { AlertCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
	onReport: (data: {
		description: string;
		severity: string;
		generatesWorkRequest: boolean;
	}) => void;
}

export function FieldNoveltyButton({ onReport }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [description, setDescription] = useState("");
	const [severity, setSeverity] = useState("medium");
	const [generatesWR, setGeneratesWR] = useState(false);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	const handleSubmit = () => {
		if (description.trim().length < 5) {
			return;
		}
		onReport({ description: description.trim(), severity, generatesWorkRequest: generatesWR });
		setDescription("");
		setSeverity("medium");
		setGeneratesWR(false);
		setIsOpen(false);
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#F44336] text-white shadow-lg hover:bg-red-700 transition"
				title="Reportar novedad encontrada en campo"
				style={{ minWidth: 56, minHeight: 56 }}
			>
				<AlertCircle className="size-6" aria-hidden="true" />
				<span className="sr-only">Reportar novedad</span>
			</button>

			<dialog
				ref={dialogRef}
				aria-label="Reportar novedad de campo"
				onClose={() => setIsOpen(false)}
				className="z-50 m-auto w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--surface-primary)] p-0 shadow-xl backdrop:bg-black/50"
			>
				{isOpen && (
					<div className="p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">Reportar novedad</h2>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								aria-label="Cerrar"
								className="text-[var(--text-secondary)]"
							>
								<X className="size-5" aria-hidden="true" />
							</button>
						</div>

						<div className="mt-4 space-y-4">
							<label className="block text-sm font-medium text-[var(--text-secondary)]">
								Descripción (mín. 5 caracteres)
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
									className="mt-1 block w-full rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
									placeholder="Describe la novedad encontrada en campo..."
								/>
							</label>

							<label className="block text-sm font-medium text-[var(--text-secondary)]">
								Severidad
								<select
									value={severity}
									onChange={(e) => setSeverity(e.target.value)}
									className="mt-1 block w-full rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
								>
									<option value="low">Baja</option>
									<option value="medium">Media</option>
									<option value="high">Alta</option>
									<option value="critical">Crítica</option>
								</select>
							</label>

							<label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
								<input
									type="checkbox"
									checked={generatesWR}
									onChange={(e) => setGeneratesWR(e.target.checked)}
								/>
								¿Genera Work Request?
							</label>
						</div>

						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="rounded-full border px-4 py-2 text-sm"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={description.trim().length < 5}
								className="rounded-full bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
							>
								Reportar
							</button>
						</div>
					</div>
				)}
			</dialog>
		</>
	);
}
