"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

interface Props {
	onApprove: () => void;
	onReject: (reason: string) => void;
}

export function ReportReviewPanel({ onApprove, onReject }: Props) {
	const [showReject, setShowReject] = useState(false);
	const [reason, setReason] = useState("");

	const handleReject = () => {
		if (reason.trim().length < 3) {
			return;
		}
		onReject(reason.trim());
		setReason("");
		setShowReject(false);
	};

	return (
		<div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
			<p className="text-sm font-semibold text-[var(--text-primary)]">Revisión del informe</p>

			<div className="flex gap-3">
				<button
					type="button"
					onClick={onApprove}
					className="flex items-center gap-2 rounded-full bg-[#4CAF50] px-5 py-2.5 text-sm font-semibold text-white"
				>
					<Check className="size-4" aria-hidden="true" /> Verificar
				</button>
				<button
					type="button"
					onClick={() => setShowReject(!showReject)}
					className="flex items-center gap-2 rounded-full border border-[#F44336] px-5 py-2.5 text-sm font-semibold text-[#F44336]"
				>
					<X className="size-4" aria-hidden="true" /> Rechazar
				</button>
			</div>

			{showReject && (
				<div className="space-y-3">
					<label className="block text-sm font-medium text-[var(--text-secondary)]">
						Motivo del rechazo (mín. 3 caracteres)
						<textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={3}
							className="mt-1 block w-full rounded-md border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
							placeholder="Describe por qué se rechaza el informe..."
						/>
					</label>
					<button
						type="button"
						onClick={handleReject}
						disabled={reason.trim().length < 3}
						className="rounded-full bg-[#F44336] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
					>
						Confirmar rechazo
					</button>
				</div>
			)}
		</div>
	);
}
