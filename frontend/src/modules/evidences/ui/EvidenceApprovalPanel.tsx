"use client";

/**
 * EvidenceApprovalPanel — Approve or reject evidence with comment
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";

interface EvidenceApprovalPanelProps {
	evidenceId: string;
	onComplete?: () => void;
}

export function EvidenceApprovalPanel({ evidenceId, onComplete }: EvidenceApprovalPanelProps) {
	const queryClient = useQueryClient();
	const [comment, setComment] = useState("");

	const approveMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post(`/evidences/${evidenceId}/verify`, { comment, verified: true });
		},
		onSuccess: () => {
			toast.success("Evidencia aprobada");
			queryClient.invalidateQueries({ queryKey: ["evidence", evidenceId] });
			onComplete?.();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const rejectMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post(`/evidences/${evidenceId}/verify`, { comment, verified: false });
		},
		onSuccess: () => {
			toast.success("Evidencia rechazada");
			queryClient.invalidateQueries({ queryKey: ["evidence", evidenceId] });
			onComplete?.();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return (
		<div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<h3 className="text-sm font-semibold text-[var(--text-primary)]">Verificar evidencia</h3>
			<textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				placeholder="Comentario sobre la verificación (opcional)"
				aria-label="Comentario de verificación"
				rows={2}
				className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2 text-sm outline-none focus:border-[var(--color-focus-ring)]"
			/>
			<div className="flex gap-2">
				<button
					type="button"
					disabled={approveMutation.isPending}
					onClick={() => approveMutation.mutate()}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{approveMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<CheckCircle2 className="size-4" />
					)}
					Aprobar
				</button>
				<button
					type="button"
					disabled={rejectMutation.isPending}
					onClick={() => rejectMutation.mutate()}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{rejectMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<XCircle className="size-4" />
					)}
					Rechazar
				</button>
			</div>
		</div>
	);
}
