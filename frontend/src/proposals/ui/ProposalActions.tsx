"use client";

import { CheckCircle, Edit, FilePlus, Send, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/_shared/lib/utils";
import { useApproveProposal, useRejectProposal, useUpdateProposal } from "@/proposals/queries";
import { normalizeProposalStatus } from "@/proposals/ui/ProposalStatusBadge";

interface ProposalActionsProps {
	proposalId: string;
	status: string;
	poNumber?: string;
	onEdit?: () => void;
	onSend?: () => void;
	onConvert?: () => void;
}

export function ProposalActions({
	proposalId,
	status,
	poNumber,
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
					toast.success("Proposal sent successfully");
					onSend?.();
				},
				onError: (error: Error) => {
					toast.error(error.message ?? "Proposal could not be sent");
				},
			},
		);
	};

	const handleApprove = () => {
		approveMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Proposal approved successfully");
			},
			onError: (error: Error) => {
				toast.error(error.message ?? "Proposal could not be approved");
			},
		});
	};

	const handleReject = () => {
		rejectMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Proposal rejected");
			},
			onError: (error: Error) => {
				toast.error(error.message ?? "Proposal could not be rejected");
			},
		});
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-2">
				{normalizedStatus === "draft" && (
					<>
						<ActionButton icon={<Edit className="h-4 w-4" />} label="Edit" onClick={onEdit} />
						<ActionButton
							icon={<Send className="h-4 w-4" />}
							label="Send"
							onClick={handleSend}
							variant="primary"
							loading={updateMutation.isPending}
						/>
					</>
				)}

				{normalizedStatus === "sent" && (
					<>
						<ActionButton
							icon={<CheckCircle className="h-4 w-4" />}
							label="Approve"
							onClick={handleApprove}
							variant="success"
							loading={approveMutation.isPending}
						/>
						<ActionButton
							icon={<XCircle className="h-4 w-4" />}
							label="Reject"
							onClick={handleReject}
							variant="danger"
							loading={rejectMutation.isPending}
						/>
					</>
				)}

				{normalizedStatus === "approved" && poNumber && (
					<ActionButton
						icon={<FilePlus className="h-4 w-4" />}
						label="Convert to order"
						onClick={onConvert}
						variant="primary"
						loading={false}
					/>
				)}

				{normalizedStatus === "approved" && !poNumber && (
					<p className="text-sm text-amber-700 dark:text-amber-300">
						Add a PO number to enable work order conversion.
					</p>
				)}

				{(normalizedStatus === "rejected" || normalizedStatus === "expired") && (
					<p className="text-sm text-slate-500 dark:text-slate-400">
						This proposal has no available actions.
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
	icon: ReactNode;
	label: string;
	onClick?: () => void;
	variant?: "default" | "primary" | "success" | "danger";
	loading?: boolean;
}) {
	const variants = {
		default:
			"border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
		primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
		success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
		danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			className={cn(
				"inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
				variants[variant],
			)}
		>
			{loading ? (
				<svg
					className="h-4 w-4 animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					role="img"
					aria-label="Loading"
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
