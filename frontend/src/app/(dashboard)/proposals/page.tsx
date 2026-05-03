"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { useProposals } from "@/proposals/queries";
import { ProposalFilters } from "@/proposals/ui/ProposalFilters";
import { ProposalStatusBadge } from "@/proposals/ui/ProposalStatusBadge";

export default function ProposalsPage() {
	const searchParams = useSearchParams();
	const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
	const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
	const offset = (page - 1) * limit;
	const status = searchParams.get("status") || undefined;
	const search = searchParams.get("search") || undefined;
	const dateFrom = searchParams.get("dateFrom") || undefined;
	const dateTo = searchParams.get("dateTo") || undefined;
	const proposalFilters = useMemo(
		() => ({
			limit,
			offset,
			...(status ? { status } : {}),
			...(search ? { search } : {}),
			...(dateFrom ? { dateFrom } : {}),
			...(dateTo ? { dateTo } : {}),
		}),
		[dateFrom, dateTo, limit, offset, search, status],
	);

	const { data, isLoading, isError } = useProposals(proposalFilters);
	const proposals = data?.items || [];
	const total = data?.total ?? proposals.length;
	const totalPages = Math.ceil(total / limit);
	const approvedCount = proposals.filter((proposal) => proposal.status === "approved").length;
	const sentCount = proposals.filter((proposal) => proposal.status === "sent").length;

	const buildHref = (p: number) => {
		const q = new URLSearchParams(searchParams.toString());
		q.set("page", String(p));
		q.set("limit", String(limit));
		return `/proposals?${q.toString()}`;
	};

	return (
		<section className="space-y-6" aria-labelledby="proposals-page-title">
			<header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-tertiary)">
						Administration
					</p>
					<h1 id="proposals-page-title" className="text-2xl font-bold text-(--text-primary)">
						Proposals
					</h1>
					<p className="mt-1 text-sm text-(--text-secondary)">
						{isLoading ? "Loading..." : `${total} proposals total`}
					</p>
				</div>
				<Link
					href="/proposals/new"
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--color-brand-blue) px-4 py-2 text-sm font-semibold text-(--text-inverse) shadow-(--shadow-brand) transition-colors hover:bg-(--color-brand-blue-hover) sm:w-auto"
				>
					<Plus aria-hidden="true" className="h-4 w-4" />
					New proposal
				</Link>
			</header>

			<section aria-label="Proposal summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[
					{ label: "Total", value: total },
					{ label: "Sent", value: sentCount, tone: "info" },
					{ label: "Approved", value: approvedCount, tone: "success" },
				].map((item) => (
					<article
						key={item.label}
						className="rounded-lg border border-(--border-default) bg-(--surface-primary) p-4 shadow-(--shadow-1)"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
							{item.label}
						</p>
						<p
							className={`mt-2 text-3xl font-bold ${item.tone === "success" ? "text-(--color-success)" : item.tone === "info" ? "text-(--color-info)" : "text-(--text-primary)"}`}
						>
							{item.value}
						</p>
					</article>
				))}
			</section>

			{/* Filters */}
			<ProposalFilters />

			{/* Table */}
			{isLoading ? (
				<div className="flex h-32 items-center justify-center rounded-lg border border-(--border-default) bg-(--surface-primary) text-sm text-(--text-tertiary) shadow-(--shadow-1)">
					Loading proposals...
				</div>
			) : isError ? (
				<div className="flex h-32 items-center justify-center rounded-lg border border-(--color-danger-bg) bg-(--color-danger-bg)/60 text-sm text-(--color-danger) shadow-(--shadow-1)">
					Proposals could not be loaded
				</div>
			) : proposals.length === 0 ? (
				<div className="flex h-32 items-center justify-center rounded-lg border border-(--border-default) bg-(--surface-primary) text-sm text-(--text-tertiary) shadow-(--shadow-1)">
					No proposals found
				</div>
			) : (
				<div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--surface-primary) shadow-(--shadow-1)">
					<div className="overflow-x-auto">
						<table className="w-full min-w-175 text-sm">
							<caption className="sr-only">
								Proposals with client, estimated value, status, sent date, and detail link.
							</caption>
							<thead>
								<tr className="border-b border-(--border-default) bg-(--surface-secondary) text-left text-xs uppercase tracking-wide text-(--text-secondary)">
									<th scope="col" className="px-5 py-3 font-medium">
										Proposal no.
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Client
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Total
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Status
									</th>
									<th scope="col" className="px-5 py-3 font-medium">
										Created
									</th>
									<th scope="col" className="px-5 py-3 font-medium sr-only">
										View
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-(--border-default)">
								{proposals.map((p) => (
									<tr
										key={p._id}
										className="group transition-colors hover:bg-(--surface-secondary)"
									>
										<td className="px-5 py-3.5">
											<Link
												href={`/proposals/${p._id}`}
												className="font-mono font-medium text-(--color-brand-blue) hover:underline"
											>
												{p.code}
											</Link>
										</td>
										<td className="max-w-50 truncate px-5 py-3.5 text-(--text-secondary)">
											{p.clientName}
										</td>
										<td className="whitespace-nowrap px-5 py-3.5 font-medium text-(--text-primary)">
											{formatCurrency(p.total)}
										</td>
										<td className="px-5 py-3.5">
											<ProposalStatusBadge status={p.status} />
										</td>
										<td className="whitespace-nowrap px-5 py-3.5 text-(--text-secondary)">
											{format(new Date(p.createdAt), "dd MMM yyyy", {
												locale: enUS,
											})}
										</td>
										<td className="px-5 py-3.5">
											<Link
												href={`/proposals/${p._id}`}
												aria-label={`View proposal ${p.code}`}
												className="text-xs font-medium text-(--color-brand-blue) opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:underline"
											>
												View
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<nav
					aria-label="Proposal pagination"
					className="flex items-center justify-between text-sm text-(--text-secondary)"
				>
					<p>
						Page {page} of {totalPages}
					</p>
					<ul className="flex gap-2">
						{page > 1 && (
							<li>
								<Link
									href={buildHref(page - 1)}
									className="rounded-lg border border-(--border-default) bg-(--surface-primary) px-3 py-1.5 text-(--text-secondary) transition-colors hover:bg-(--surface-secondary)"
								>
									Previous
								</Link>
							</li>
						)}
						{page < totalPages && (
							<li>
								<Link
									href={buildHref(page + 1)}
									className="rounded-lg border border-(--border-default) bg-(--surface-primary) px-3 py-1.5 text-(--text-secondary) transition-colors hover:bg-(--surface-secondary)"
								>
									Next
								</Link>
							</li>
						)}
					</ul>
				</nav>
			)}
		</section>
	);
}
