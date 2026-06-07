"use client";

import { CheckCircle, Edit, FilePlus, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { normalizeProposalStatus } from "@/modules/proposals/proposal-status";
import {
	useApproveProposal,
	useRejectProposal,
	useUpdateProposal,
} from "@/modules/proposals/queries";

interface ProposalActionsProps {
	proposalId: string;
	status: string;
	onEdit?: () => void;
	onSend?: () => void;
	onConvert?: () => void;
}

type ActionButtonVariant = "default" | "primary" | "success" | "danger";

const ACTION_BUTTON_VARIANTS: Record<ActionButtonVariant, string> = {
	default:
		"border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
	primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
	success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
	danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
};

export function ProposalActions({
	proposalId,
	status,
	onEdit,
	onSend,
	onConvert,
}: ProposalActionsProps) {
	const normalizedStatus = normalizeProposalStatus(status);

	const approveMutation = useApproveProposal(proposalId);
	const rejectMutation = useRejectProposal(proposalId);
	const updateMutation = useUpdateProposal(proposalId);

	const handleSend = () => {
		updateMutation.mutate(
			{ status: "sent" as const },
			{
				onSuccess: () => {
					toast.success("Propuesta enviada correctamente");
					onSend?.();
				},
				onError: (error: Error) => {
					toast.error(error.message ?? "Error al enviar la propuesta");
				},
			},
		);
	};

	const handleApprove = () => {
		approveMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Propuesta aprobada correctamente");
			},
			onError: (error: Error) => {
				toast.error(error.message ?? "Error al aprobar la propuesta");
			},
		});
	};

	const handleReject = () => {
		rejectMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Propuesta rechazada");
			},
			onError: (error: Error) => {
				toast.error(error.message ?? "Error al rechazar la propuesta");
			},
		});
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-2">
				{normalizedStatus === "draft" && (
					<>
						<ActionButton icon={<Edit className="size-4" />} label="Editar" onClick={onEdit} />
						<ActionButton
							icon={<Send className="size-4" />}
							label="Enviar"
							onClick={handleSend}
							variant="primary"
							loading={updateMutation.isPending}
						/>
					</>
				)}

				{normalizedStatus === "sent" && (
					<>
						<ActionButton
							icon={<CheckCircle className="size-4" />}
							label="Aprobar"
							onClick={handleApprove}
							variant="success"
							loading={approveMutation.isPending}
						/>
						<ActionButton
							icon={<XCircle className="size-4" />}
							label="Rechazar"
							onClick={handleReject}
							variant="danger"
							loading={rejectMutation.isPending}
						/>
					</>
				)}

				{normalizedStatus === "approved" && (
					<ActionButton
						icon={<FilePlus className="size-4" />}
						label="Convertir a Orden"
						onClick={onConvert}
						variant="primary"
					/>
				)}

				{(normalizedStatus === "rejected" || normalizedStatus === "expired") && (
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Esta propuesta no tiene acciones disponibles.
					</p>
				)}
			</div>
		</div>
	);
}

function ActionButton({
	icon,
	label,
	onClick,
	variant = "default",
	loading = false,
}: {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	variant?: ActionButtonVariant;
	loading?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			className={cn(
				"inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
				ACTION_BUTTON_VARIANTS[variant],
			)}
		>
			{loading ? (
				<svg
					className="size-4 animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					role="img"
					aria-label="Cargando"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
			) : (
				icon
			)}
			{label}
		</button>
	);
}
