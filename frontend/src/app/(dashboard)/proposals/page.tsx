"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { normalizePagination } from "@/lib/pagination";
import { cloneSearchParams, readSearchParam } from "@/lib/utils/search-params";
import type { Proposal } from "@/modules/proposals/queries";
import { useProposals } from "@/modules/proposals/queries";
import { ProposalFilters } from "@/modules/proposals/ui/ProposalFilters";
import { ProposalStatusBadge } from "@/modules/proposals/ui/ProposalStatusBadge";

const COP_CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatCOP(value: number): string {
	return COP_CURRENCY_FORMATTER.format(value);
}

function formatProposalDate(value: string): string {
	return format(parseISO(value), "dd MMM yyyy", { locale: es });
}

function countProposalsByStatus(proposals: Proposal[], statuses: readonly string[]): number {
	return proposals.filter((proposal) => statuses.includes(proposal.status ?? "")).length;
}

function buildProposalPageHref(searchParams: URLSearchParams, limit: number, page: number): string {
	const q = cloneSearchParams(searchParams);
	q.set("page", String(page));
	q.set("limit", String(limit));
	return `/proposals?${q.toString()}`;
}

export default function ProposalsPage() {
	return (
		<Suspense fallback={<ProposalsLoading />}>
			<ProposalsPageInner />
		</Suspense>
	);
}

function ProposalsLoading() {
	return (
		<section className="space-y-6" aria-labelledby="proposals-page-title">
			<div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm text-[var(--text-tertiary)] shadow-[var(--shadow-1)]">
				Cargando propuestas…
			</div>
		</section>
	);
}

function ProposalsPageInner() {
	const searchParams = useSearchParams();

	const getSearchParam = (key: string) => readSearchParam(searchParams, key);
	const { page, limit, offset } = normalizePagination({
		page: getSearchParam("page") || null,
		limit: getSearchParam("limit") || null,
	});
	const status = getSearchParam("status") || undefined;

	const { data, isLoading, isError } = useProposals({ limit, offset, status: status ?? "" });
	const proposals = data?.items || [];
	const total = data?.total ?? proposals.length;
	const totalPages = Math.ceil(total / limit);
	const approvedCount = countProposalsByStatus(proposals, ["approved", "aprobada"]);
	const sentCount = countProposalsByStatus(proposals, ["sent", "enviada"]);

	return (
		<section className="space-y-6" aria-labelledby="proposals-page-title">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
						Administración
					</p>
					<h1
						id="proposals-page-title"
						className="text-2xl font-semibold text-[var(--text-primary)]"
					>
						Propuestas
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						{isLoading ? "Cargando…" : `${total} propuestas en total`}
					</p>
				</div>
				<Link
					href="/proposals/new"
					className="flex items-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-brand)] hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Plus aria-hidden="true" className="size-4" />
					Nueva Propuesta
				</Link>
			</div>

			<section aria-label="Resumen de propuestas" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[
					{ label: "Total", value: total },
					{ label: "Enviadas", value: sentCount, tone: "info" },
					{ label: "Aprobadas", value: approvedCount, tone: "success" },
				].map((item) => (
					<article
						key={item.label}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							{item.label}
						</p>
						<p
							className={`mt-2 text-3xl font-semibold ${item.tone === "success" ? "text-[var(--color-success)]" : item.tone === "info" ? "text-[var(--color-info)]" : "text-[var(--text-primary)]"}`}
						>
							{item.value}
						</p>
					</article>
				))}
			</section>

			{/* Filters */}
			<ProposalFilters />

			{/* Table */}
			<ProposalListContent proposals={proposals} isLoading={isLoading} isError={isError} />

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
					<p>
						Página {page} de {totalPages}
					</p>
					<div className="flex gap-2">
						{page > 1 && (
							<Link
								href={buildProposalPageHref(searchParams, limit, page - 1)}
								className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-colors"
							>
								Anterior
							</Link>
						)}
						{page < totalPages && (
							<Link
								href={buildProposalPageHref(searchParams, limit, page + 1)}
								className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-colors"
							>
								Siguiente
							</Link>
						)}
					</div>
				</div>
			)}
		</section>
	);
}

function ProposalListContent({
	proposals,
	isLoading,
	isError,
}: {
	proposals: Proposal[];
	isLoading: boolean;
	isError: boolean;
}) {
	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm text-[var(--text-tertiary)] shadow-[var(--shadow-1)]">
				Cargando propuestas…
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 text-sm text-[var(--color-danger)] shadow-[var(--shadow-1)]">
				Error al cargar propuestas
			</div>
		);
	}

	if (proposals.length === 0) {
		return (
			<div className="flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] text-sm text-[var(--text-tertiary)] shadow-[var(--shadow-1)]">
				No hay propuestas
			</div>
		);
	}

	return <ProposalTable proposals={proposals} />;
}

function ProposalTable({ proposals }: { proposals: Proposal[] }) {
	return (
		<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[700px] text-sm">
					<caption className="sr-only">
						Propuestas con cliente, valor estimado, estado, fecha de envío y enlace al detalle.
					</caption>
					<thead>
						<tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
							<th scope="col" className="px-5 py-3 font-medium">
								N° Propuesta
							</th>
							<th scope="col" className="px-5 py-3 font-medium">
								Cliente
							</th>
							<th scope="col" className="px-5 py-3 font-medium">
								Total
							</th>
							<th scope="col" className="px-5 py-3 font-medium">
								Estado
							</th>
							<th scope="col" className="px-5 py-3 font-medium">
								Creada
							</th>
							<th scope="col" className="px-5 py-3 font-medium sr-only">
								Ver
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-default)]">
						{proposals.map((p) => (
							<tr
								key={p._id}
								className="group transition-colors hover:bg-[var(--surface-secondary)]"
							>
								<td className="px-5 py-3.5">
									<Link
										href={`/proposals/${p._id}`}
										className="font-mono font-medium text-[var(--color-brand-blue)] hover:underline"
									>
										{p.proposalNumber ?? p._id}
									</Link>
								</td>
								<td className="max-w-[200px] truncate px-5 py-3.5 text-[var(--text-secondary)]">
									{p.clientName ?? ","}
								</td>
								<td className="whitespace-nowrap px-5 py-3.5 font-medium text-[var(--text-primary)]">
									{formatCOP(p.estimatedValue ?? 0)}
								</td>
								<td className="px-5 py-3.5">
									<ProposalStatusBadge status={p.status ?? ""} />
								</td>
								<td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
									{p.createdAt ? formatProposalDate(p.createdAt) : ","}
								</td>
								<td className="px-5 py-3.5">
									<Link
										href={`/proposals/${p._id}`}
										aria-label={`Ver propuesta ${p.proposalNumber ?? p._id}`}
										className="text-xs font-medium text-[var(--color-brand-blue)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:underline"
									>
										Ver →
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
