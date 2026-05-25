"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/http/api-client";
import { ProposalActions } from "@/modules/proposals/ui/ProposalActions";
import {
	normalizeProposalStatus,
	ProposalStatusBadge,
} from "@/modules/proposals/ui/ProposalStatusBadge";

interface ProposalDetail {
	_id: string;
	code: string;
	title: string;
	clientName: string;
	status: string;
	total: number;
	subtotal: number;
	taxRate: number;
	validUntil: string | null;
	approvedAt: string | null;
	approvedBy: string | null;
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

function propDate(p: Record<string, unknown>, ...keys: string[]): string | null {
	for (const key of keys) {
		const val = p[key];
		if (val != null) {
			return String(val);
		}
	}
	return null;
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

	const {
		data: proposal,
		isLoading,
		error,
	} = useQuery<ProposalDetail>({
		queryKey: ["proposal", id],
		queryFn: () => fetchProposalDetail(id),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-3xl border border-zinc-200 dark:border-zinc-800">
				<span className="text-zinc-500">Cargando detalles de propuesta…</span>
			</div>
		);
	}

	if (error || !proposal) {
		return (
			<div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/20 dark:text-red-400">
				No se pudo cargar la propuesta. {(error as Error)?.message}
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
						className="mt-1 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<FileText aria-hidden="true" className="size-6 text-blue-600 dark:text-blue-500" />
							<h1
								id="proposal-detail-title"
								className="text-2xl font-semibold font-mono text-zinc-900 dark:text-white"
							>
								{proposal.code}
							</h1>
							<ProposalStatusBadge status={proposal.status} />
						</div>
						<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{proposal.clientName}</p>
					</div>
				</div>

				{/* Approve / Reject actions (only when sent) */}
				{normalizedStatus === "sent" && (
					<ProposalActions proposalId={proposal._id} status={proposal.status} />
				)}
			</div>

			{/* Details Card */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
					Información General
				</h2>
				<dl className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Número</dt>
						<dd className="mt-1 font-mono text-zinc-900 dark:text-white">{proposal.code}</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Estado</dt>
						<dd className="mt-1">
							<ProposalStatusBadge status={proposal.status} />
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Cliente</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">{proposal.clientName}</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Total</dt>
						<dd className="mt-1 font-semibold text-zinc-900 dark:text-white">
							{formatCOP(Number(proposal.total))}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Válida hasta</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{proposal.validUntil ? formatProposalDate(proposal.validUntil) : ","}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Aprobada el</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{proposal.approvedAt ? formatProposalDate(proposal.approvedAt) : ","}
						</dd>
					</div>
					{Array.isArray(proposal.generatedOrders) && proposal.generatedOrders.length > 0 && (
						<div>
							<dt className="font-medium text-zinc-500 dark:text-zinc-400">Ordenes generadas</dt>
							<dd className="mt-1">
								<div className="space-y-1">
									{proposal.generatedOrders.map((orderId) => (
										<Link
											key={orderId}
											href={`/orders/${orderId}`}
											className="font-mono text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
										>
											Ver orden →
										</Link>
									))}
								</div>
							</dd>
						</div>
					)}
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Creada</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{proposal.createdAt ? formatProposalDate(proposal.createdAt) : ","}
						</dd>
					</div>
					<div>
						<dt className="font-medium text-zinc-500 dark:text-zinc-400">Actualizada</dt>
						<dd className="mt-1 text-zinc-900 dark:text-white">
							{proposal.updatedAt ? formatProposalDate(proposal.updatedAt) : ","}
						</dd>
					</div>
				</dl>
			</div>

			{/* Description */}
			<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
					Descripción
				</h2>
				<p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
					{proposal.title}
					{proposal.notes ? `\n\n${proposal.notes}` : ""}
				</p>
			</div>
		</section>
	);
}
