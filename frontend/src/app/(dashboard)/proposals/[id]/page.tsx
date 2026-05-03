"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { useProposal } from "@/proposals/queries";
import { ConvertProposalDialog } from "@/proposals/ui/ConvertProposalDialog";
import { ProposalActions } from "@/proposals/ui/ProposalActions";
import { normalizeProposalStatus, ProposalStatusBadge } from "@/proposals/ui/ProposalStatusBadge";

export default function ProposalDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

	const { data: proposal, isLoading, error } = useProposal(id);
	const errorMessage = error instanceof Error ? error.message : "";

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800">
				<span className="text-slate-500">Loading proposal details...</span>
			</div>
		);
	}

	if (error || !proposal) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/20 dark:text-red-400">
				Proposal could not be loaded. {errorMessage}
			</div>
		);
	}

	const normalizedStatus = normalizeProposalStatus(proposal.status);

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="proposal-detail-title">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<Link
						href="/proposals"
						className="mt-1 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
					>
						<ArrowLeft aria-hidden="true" className="h-4 w-4" />
						Back
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<FileText aria-hidden="true" className="h-6 w-6 text-blue-600 dark:text-blue-500" />
							<h1
								id="proposal-detail-title"
								className="text-2xl font-bold font-mono text-slate-900 dark:text-white"
							>
								{proposal.code}
							</h1>
							<ProposalStatusBadge status={proposal.status} />
						</div>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{proposal.clientName}</p>
					</div>
				</div>

				{/* Approve / Reject / Convert actions */}
				{(normalizedStatus === "sent" || normalizedStatus === "approved") && (
					<ProposalActions
						proposalId={proposal._id}
						status={proposal.status}
						poNumber={proposal.poNumber}
						onConvert={() => setIsConvertDialogOpen(true)}
					/>
				)}
			</div>

			<ConvertProposalDialog
				proposalId={proposal._id}
				proposalTitle={proposal.title}
				isOpen={isConvertDialogOpen}
				onOpenChange={setIsConvertDialogOpen}
			/>

			{/* Details Card */}
			<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
					General information
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Number</dt>
						<dd className="mt-1 font-mono text-slate-900 dark:text-white">{proposal.code}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Client</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">{proposal.clientName}</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Status</dt>
						<dd className="mt-1">
							<ProposalStatusBadge status={proposal.status} />
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Total</dt>
						<dd className="mt-1 font-semibold text-slate-900 dark:text-white">
							{formatCurrency(proposal.total)}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Valid until</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{format(new Date(proposal.validUntil), "dd MMM yyyy", { locale: enUS })}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-slate-500 dark:text-slate-400">Created at</dt>
						<dd className="mt-1 text-slate-900 dark:text-white">
							{format(new Date(proposal.createdAt), "dd MMM yyyy", { locale: enUS })}
						</dd>
					</div>
				</dl>

				{proposal.notes && (
					<div className="mt-6">
						<h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
							Description
						</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
							{proposal.notes}
						</p>
					</div>
				)}
			</div>

			{/* Generated Orders */}
			{proposal.generatedOrders && proposal.generatedOrders.length > 0 && (
				<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
						Generated orders
					</h2>
					<ul className="space-y-2">
						{proposal.generatedOrders.map((orderId) => (
							<li key={orderId} className="text-sm">
								<Link
									href={`/orders/${orderId}`}
									className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									Order {orderId}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}
