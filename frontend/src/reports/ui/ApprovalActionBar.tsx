"use client";

import { APPROVER_ROLES, hasRole } from "@cermont/shared-types/rbac";
import { CheckCircle2, FileWarning, RefreshCw, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/_shared/store/auth.store";
import { Button } from "@/core/ui/Button";
import {
	useApproveReport,
	useOrderReport,
	useRejectReport,
	useSyncReport,
} from "@/reports/queries";

interface ApprovalActionBarProps {
	orderId: string;
	onActionComplete?: () => void;
}

export function ApprovalActionBar({ orderId, onActionComplete }: ApprovalActionBarProps) {
	const { data: report, isLoading } = useOrderReport(orderId);
	const approveReport = useApproveReport(report?._id ?? "");
	const rejectReport = useRejectReport(report?._id ?? "");
	const syncReport = useSyncReport(orderId);
	const currentRole = useAuthStore((state) => state.user?.role);
	const [rejectionReason, setRejectionReason] = useState("");

	const canReview = hasRole(currentRole ?? "", APPROVER_ROLES);
	const isPending = approveReport.isPending || rejectReport.isPending || syncReport.isPending;

	const handleApprove = async () => {
		if (!report) {
			return;
		}

		try {
			await approveReport.mutateAsync();
			toast.success("Informe aprobado");
			onActionComplete?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo aprobar el informe");
		}
	};

	const handleReject = async () => {
		if (!report) {
			return;
		}

		try {
			await rejectReport.mutateAsync(rejectionReason.trim() || "Rechazado para ajustes");
			toast.success("Informe devuelto a campo");
			setRejectionReason("");
			onActionComplete?.();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo rechazar el informe");
		}
	};

	const handleSync = async () => {
		try {
			await syncReport.mutateAsync();
			toast.success("Informe sincronizado");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo sincronizar");
		}
	};

	if (isLoading) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 text-sm text-[var(--text-secondary)]">
				Cargando acciones del informe...
			</div>
		);
	}

	if (!report) {
		return (
			<div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
					<FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
					<p>Esta orden aún no tiene borrador de informe.</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleSync}
					loading={syncReport.isPending}
				>
					<RefreshCw className="h-4 w-4" aria-hidden="true" />
					Sincronizar
				</Button>
			</div>
		);
	}

	if (report.status === "approved") {
		return (
			<div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-success)]/20 bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">
				<CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
				Informe aprobado y listo para facturación.
			</div>
		);
	}

	if (report.status === "rejected") {
		return (
			<div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
				<ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
				Rechazado: {report.rejectionReason || "Sin motivo especificado"}
			</div>
		);
	}

	if (!canReview) {
		return (
			<div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-[var(--text-secondary)]">
					Pendiente de aprobación por supervisor o gerente.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleSync}
					loading={syncReport.isPending}
				>
					<RefreshCw className="h-4 w-4" aria-hidden="true" />
					Sincronizar
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
				<Button
					type="button"
					onClick={handleApprove}
					disabled={isPending}
					aria-label="Aprobar informe"
					className="bg-[var(--color-success)] hover:opacity-90"
				>
					<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
					Aprobar y enviar a cliente
				</Button>

				<div className="flex flex-1 flex-col gap-2 sm:flex-row">
					<label className="sr-only" htmlFor={`rejection-reason-${orderId}`}>
						Motivo de devolución
					</label>
					<input
						id={`rejection-reason-${orderId}`}
						value={rejectionReason}
						onChange={(event) => setRejectionReason(event.target.value)}
						placeholder="Motivo de devolución"
						className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-brand-blue)]"
					/>
					<Button
						type="button"
						variant="outline"
						onClick={handleReject}
						disabled={isPending}
						aria-label="Devolver informe a campo"
						className="border-[color:var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
					>
						<ShieldAlert className="h-4 w-4" aria-hidden="true" />
						Devolver
					</Button>
				</div>
			</div>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleSync}
				loading={syncReport.isPending}
			>
				<RefreshCw className="h-4 w-4" aria-hidden="true" />
				Sincronizar datos
			</Button>
		</div>
	);
}
