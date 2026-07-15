"use client";

import type { ProposalCostBreakdown as ProposalCostBreakdownType } from "@cermont/shared-types";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PROPOSALS_KEYS } from "@/modules/proposals/queries";
import { ProposalActions } from "@/modules/proposals/ui/ProposalActions";
import { ProposalCostBreakdown } from "@/modules/proposals/ui/ProposalCostBreakdown";
import { StatusBadge } from "@/core/ui/StatusBadge";
import "@/modules/proposals/ui/ApproveWithSupportModal";
import "@/modules/proposals/ui/VersionHistory";

interface ProposalDetail {
	_id: string;
	code: string;
	title: string;
	clientName: string;
	status: string;
	total: number;
	subtotal: number;
	taxRate: number;
	validUntil: string | undefined;
	approvedAt: string | undefined;
	approvedBy: string | undefined;
	notes: string;
	createdAt: string;
	updatedAt: string;
	generatedOrders: string[];
}

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

function propString(p: Record<string, unknown>, ...keys: string[]): string {
	for (const key of keys) {
		const val = p[key];
		if (val != null) {
			return String(val);
		}
	}
	return "";
}

function propNum(p: Record<string, unknown>, ...keys: string[]): number {
	for (const key of keys) {
		const val = p[key];
		if (val != null) {
			return Number(val);
		}
	}
	return 0;
}

function propDate(p: Record<string, unknown>, ...keys: string[]): string | undefined {
	for (const key of keys) {
		const val = p[key];
		if (val != null) {
			return String(val);
		}
	}
	return undefined;
}

async function fetchProposalDetail(id: string): Promise<ProposalDetail> {
	const body = await apiClient.get<Record<string, unknown>>(`/proposals/${id}`);
	if (!body?.success) {
		throw new String(body?.message ?? body?.error ?? "Error al cargar propuesta");
	}
	const p = body.data as Record<string, unknown> | undefined;
	if (!p) {
		throw new Error("Propuesta no encontrada");
	}
	const generatedOrders: string[] = Array.isArray(p.generatedOrders)
		? (p.generatedOrders as Array<unknown>).map((o: unknown) => String(o ?? ""))
		: [];
	return {
		_id: propString(p, "_id", "id"),
		code: propString(p, "code", "proposalNumber", "numero_propuesta"),
		title: propString(p, "title", "titulo"),
		clientName: propString(p, "clientName", "cliente"),
		status: propString(p, "status", "estado"),
		total: propNum(p, "total", "valor_estimado", "estimatedValue"),
		subtotal: propNum(p, "subtotal"),
		taxRate: propNum(p, "taxRate"),
		validUntil: propDate(p, "validUntil", "fecha_vencimiento"),
		approvedAt: propDate(p, "approvedAt", "fecha_aprobacion"),
		approvedBy: propDate(p, "approvedBy"),
		notes: propString(p, "notes", "descripcion"),
		createdAt: propString(p, "createdAt", "created_at"),
		updatedAt: propString(p, "updatedAt", "updated_at"),
		generatedOrders,
	};
}

export default function ProposalDetailPage() {
	const params = useParams();
	const id = params.id as string;
	const { accessToken } = useAuth();

	const {
		data: proposal,
		isLoading,
		error,
	} = useQuery<ProposalDetail>({
		queryKey: PROPOSALS_KEYS.detail(id),
		queryFn: () => fetchProposalDetail(id),
		enabled: !!id,
	});

	const {
		data: costBreakdown,
		isLoading: isCostsLoading,
	} = useQuery<ProposalCostBreakdownType>({
		queryKey: [...PROPOSALS_KEYS.detail(id), "costs"],
		queryFn: async () => {
			const body = await apiClient.get<{ success: boolean; data: ProposalCostBreakdownType }>(
				`/proposals/${id}/costs`,
			);
			if (!body?.success || !body?.data) {
				throw new Error("No se pudo cargar el desglose de costos");
			}
			return body.data;
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
				<span className="text-steel">Cargando detalles de propuesta…</span>
			</div>
		);
	}

	if (error || !proposal) {
		return (
			<div className="p-4 bg-red-50 text-brand-error rounded-lg dark:bg-red-900/20 dark:text-brand-error">
				No se pudo cargar la propuesta. {(error as Error)?.message}
			</div>
		);
	}

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="proposal-detail-title">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<Link
						href="/proposals"
						className="mt-1 flex items-center gap-1 text-sm text-steel hover:text-charcoal dark:text-steel dark:hover:text-stone"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<FileText
								aria-hidden="true"
								className="size-6 text-brand-green dark:text-brand-green"
							/>
							<h1
								id="proposal-detail-title"
								className="text-2xl font-semibold font-mono text-ink dark:text-white"
							>
								{proposal.code}
							</h1>
							<StatusBadge status={proposal.status} variant="flat" size="sm" />
						</div>
						<p className="mt-1 text-sm text-steel dark:text-steel">{proposal.clientName}</p>
					</div>
				</div>

				{/* Status actions based on current status */}
				<ProposalActions proposalId={proposal._id} status={proposal.status} />
			</div>

			{/* Details Card */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel">
					Información General
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-steel dark:text-steel">Número</dt>
						<dd className="mt-1 font-mono text-ink dark:text-white">{proposal.code}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Estado</dt>
						<dd className="mt-1">
							<StatusBadge status={proposal.status} variant="flat" size="sm" />
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Cliente</dt>
						<dd className="mt-1 text-ink dark:text-white">{proposal.clientName}</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Total</dt>
						<dd className="mt-1 font-semibold text-ink dark:text-white">
							{formatCOP(Number(proposal.total))}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Válida hasta</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{proposal.validUntil ? formatProposalDate(proposal.validUntil) : ","}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Aprobada el</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{proposal.approvedAt ? formatProposalDate(proposal.approvedAt) : ","}
						</dd>
					</div>
					{Array.isArray(proposal.generatedOrders) && proposal.generatedOrders.length > 0 && (
						<div>
							<dt className="font-medium text-steel dark:text-steel">Ordenes generadas</dt>
							<dd className="mt-1">
								<div className="space-y-1">
									{proposal.generatedOrders.map((orderId) => (
										<Link
											key={orderId}
											href={`/orders/${orderId}`}
											className="font-mono text-brand-green hover:text-brand-green hover:underline dark:text-brand-green dark:hover:text-brand-green"
										>
											Ver orden →
										</Link>
									))}
								</div>
							</dd>
						</div>
					)}
					<div>
						<dt className="font-medium text-steel dark:text-steel">Creada</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{proposal.createdAt ? formatProposalDate(proposal.createdAt) : ","}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-steel dark:text-steel">Actualizada</dt>
						<dd className="mt-1 text-ink dark:text-white">
							{proposal.updatedAt ? formatProposalDate(proposal.updatedAt) : ","}
						</dd>
					</div>
				</dl>
			</div>

			{/* Description */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-steel">
					Descripción
				</h2>
				<p className="text-sm text-charcoal dark:text-stone whitespace-pre-wrap">
					{proposal.title}
					{proposal.notes ? `\n\n${proposal.notes}` : ""}
				</p>
			</div>

			{/* Cost Breakdown */}
			{isCostsLoading ? (
				<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
					<Skeleton variant="text" height={24} />
					<div className="mt-4 space-y-2">
						<Skeleton variant="text" height={16} />
						<Skeleton variant="text" height={16} />
						<Skeleton variant="text" height={16} />
					</div>
				</div>
			) : costBreakdown ? (
				<ProposalCostBreakdown
					proposalId={proposal._id}
					breakdown={costBreakdown}
					accessToken={accessToken ?? ""}
				/>
			) : null}
		</section>
	);
}
