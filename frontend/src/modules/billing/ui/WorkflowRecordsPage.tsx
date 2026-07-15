"use client";

import {
	AlertTriangle,
	ArrowRight,
	Banknote,
	CheckCircle2,
	FileCheck2,
	FileText,
	RefreshCw,
	UploadCloud,
	WifiOff,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/core/ui/EmptyState";
import type { EmptyStateKind } from "@/core/ui/EmptyStateIllustration";
import { useConnectivity } from "@/lib/offline/connectivity";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import type { WorkflowList } from "../queries";
import { localeNumber } from "@/lib/utils/format-date";

type QueryState<T> = {
	data?: WorkflowList<T>;
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
};

type RecordRow = {
	id: string;
	code: string;
	status: string;
	title: string;
	subtitle: string;
	amount?: number;
	currency?: string;
	href?: string;
	updatedAt: string;
};

export type WorkflowRecordsActiveContext = {
	clearHref: string;
	label: string;
	value: string;
};

type RecordsPageProps<T> = {
	activeContext?: WorkflowRecordsActiveContext;
	eyebrow: string;
	title: string;
	description: string;
	emptyTitle: string;
	emptyDescription: string;
	emptyIcon: EmptyStateKind;
	query: QueryState<T>;
	rows: (items: T[]) => RecordRow[];
	primaryLinks: Array<{ href: string; label: string }>;
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

function formatCurrency(amount: number | undefined, currency: string | undefined): string {
	if (typeof amount !== "number") {
		return "Sin valor";
	}
	if (currency === "COP" || !currency) {
		return currencyFormatter.format(amount);
	}
	return `${currency} ${localeNumber(amount)}`;
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Sin fecha";
	}
	return dateFormatter.format(date);
}

function statusTone(status: string): string {
	if (["approved", "accepted", "signed", "paid", "reconciled"].includes(status)) {
		return "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]";
	}
	if (["rejected", "cancelled"].includes(status)) {
		return "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]";
	}
	if (["submitted", "sent", "issued", "recorded", "due"].includes(status)) {
		return "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]";
	}
	return "border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";
}

function Header({
	eyebrow,
	title,
	description,
	primaryLinks,
}: Pick<RecordsPageProps<RecordRow>, "eyebrow" | "title" | "description" | "primaryLinks">) {
	return (
		<header className="space-y-4">
			<div>
				<p className="text-sm font-medium text-[var(--color-brand)]">{eyebrow}</p>
				<h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
				<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
					{description}
				</p>
			</div>
			<nav className="flex flex-wrap gap-2" aria-label={`Acciones de ${title}`}>
				{primaryLinks.map((link) =>
					link.href === "/documents" ? (
						<ContextualDocumentUploadModal
							key="contextual-docs"
							defaultPurpose="support_document"
							title="Adjuntar soporte documental"
							description="Selecciona caso, orden y paso para adjuntar soportes sin salir del flujo."
						>
							<button
								type="button"
								className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-card transition-colors hover:bg-[var(--surface-secondary)]"
							>
								{link.label}
								<UploadCloud className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
							</button>
						</ContextualDocumentUploadModal>
					) : (
						<Link
							key={link.href}
							href={link.href}
							className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-card transition-colors hover:bg-[var(--surface-secondary)]"
						>
							{link.label}
							<ArrowRight className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
						</Link>
					),
				)}
			</nav>
		</header>
	);
}

function OfflineNotice() {
	return (
		<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]">
			<WifiOff className="mt-0.5 size-4" aria-hidden="true" />
			<p>
				Estás sin conexión. La vista conserva el último estado consultado y las acciones
				documentales deben sincronizarse desde Documentos o Evidencias al volver la red.
			</p>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="grid gap-3">
			{[0, 1, 2].map((item) => (
				<div
					key={item}
					className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]"
				/>
			))}
		</div>
	);
}

export function WorkflowRecordsPageLoadingState() {
	return (
		<section className="space-y-6" aria-busy="true" aria-label="Loading workflow records">
			<LoadingState />
		</section>
	);
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
			<div className="flex items-start gap-3">
				<AlertTriangle className="mt-0.5 size-5 text-[var(--color-danger)]" aria-hidden="true" />
				<div>
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar el módulo
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El endpoint respondió con error o la sesión expiró.
					</p>
					<button
						type="button"
						onClick={onRetry}
						className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
					>
						<RefreshCw className="size-4" aria-hidden="true" />
						Reintentar
					</button>
				</div>
			</div>
		</div>
	);
}

function WorkflowEmptyActions() {
	return (
		<>
			<ContextualDocumentUploadModal
				defaultPurpose="support_document"
				title="Adjuntar soporte documental"
				description="Selecciona caso, orden y paso para cargar soportes administrativos u operativos sin salir del flujo."
			>
				<button
					type="button"
					className="min-h-11 rounded-full bg-[var(--color-brand)] px-5 py-2 text-sm font-medium text-white"
				>
					Subir PDF, Excel o Word
				</button>
			</ContextualDocumentUploadModal>
			<ContextualDocumentUploadModal
				defaultPurpose="closing_evidence"
				title="Adjuntar fotos o evidencia visual"
				description="Carga fotos y soportes visuales vinculándolos al paso de cierre correspondiente."
			>
				<button
					type="button"
					className="min-h-11 rounded-full border border-[var(--border-subtle)] px-5 py-2 text-sm font-medium text-[var(--text-primary)]"
				>
					Subir fotos
				</button>
			</ContextualDocumentUploadModal>
		</>
	);
}

function RecordsTable({ rows }: { rows: RecordRow[] }) {
	return (
		<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-card">
			<table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
				<thead className="bg-[var(--surface-secondary)] text-left text-xs uppercase text-[var(--text-muted)]">
					<tr>
						<th className="px-4 py-3 font-semibold">Código</th>
						<th className="px-4 py-3 font-semibold">Detalle</th>
						<th className="px-4 py-3 font-semibold">Estado</th>
						<th className="px-4 py-3 font-semibold">Valor</th>
						<th className="px-4 py-3 font-semibold">Actualizado</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[var(--border-subtle)]">
					{rows.map((row) => (
						<tr key={row.id}>
							<td className="px-4 py-3 font-medium text-[var(--text-primary)]">
								{row.href ? <Link href={row.href}>{row.code}</Link> : row.code}
							</td>
							<td className="px-4 py-3">
								<p className="font-medium text-[var(--text-primary)]">{row.title}</p>
								<p className="text-xs text-[var(--text-secondary)]">{row.subtitle}</p>
							</td>
							<td className="px-4 py-3">
								<span
									className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(row.status)}`}
								>
									{row.status}
								</span>
							</td>
							<td className="px-4 py-3 text-[var(--text-secondary)]">
								{formatCurrency(row.amount, row.currency)}
							</td>
							<td className="px-4 py-3 text-[var(--text-secondary)]">
								{formatDate(row.updatedAt)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function RecordsCards({ rows }: { rows: RecordRow[] }) {
	return (
		<div className="grid gap-3 md:hidden">
			{rows.map((row) => (
				<article
					key={row.id}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-card"
				>
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-sm font-semibold text-[var(--text-primary)]">{row.code}</p>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">{row.subtitle}</p>
						</div>
						<span
							className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusTone(row.status)}`}
						>
							{row.status}
						</span>
					</div>
					<p className="mt-3 text-sm text-[var(--text-primary)]">{row.title}</p>
					<div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
						<span>{formatCurrency(row.amount, row.currency)}</span>
						<span>{formatDate(row.updatedAt)}</span>
					</div>
				</article>
			))}
		</div>
	);
}

function ActiveContextBanner({ context }: { context: WorkflowRecordsActiveContext }) {
	return (
		<div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] px-4 py-3 text-sm text-[var(--text-primary)] sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand)]">
					Active filter
				</p>
				<p className="mt-1">
					{context.label}: <span className="font-semibold">{context.value}</span>
				</p>
			</div>
			<Link
				href={context.clearHref}
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				View all records
				<ArrowRight className="size-4" aria-hidden="true" />
			</Link>
		</div>
	);
}

export function WorkflowRecordsPage<T>({
	activeContext,
	eyebrow,
	title,
	description,
	emptyTitle,
	emptyDescription,
	emptyIcon,
	query,
	rows,
	primaryLinks,
}: RecordsPageProps<T>) {
	const { isOnline } = useConnectivity();
	const normalizedRows = rows(query.data?.items ?? []);

	return (
		<section className="space-y-6" aria-labelledby="workflow-records-title">
			<Header
				eyebrow={eyebrow}
				title={title}
				description={description}
				primaryLinks={primaryLinks}
			/>
			{activeContext ? <ActiveContextBanner context={activeContext} /> : null}
			{!isOnline ? <OfflineNotice /> : null}
			<WorkflowStats rows={normalizedRows} total={query.data?.total ?? normalizedRows.length} />
			{query.isLoading ? <LoadingState /> : null}
			{query.isError ? <ErrorState onRetry={query.refetch} /> : null}
			{!query.isLoading && !query.isError && normalizedRows.length === 0 ? (
				<EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription}>
					<WorkflowEmptyActions />
				</EmptyState>
			) : null}
			{normalizedRows.length > 0 ? (
				<>
					<div className="hidden md:block">
						<RecordsTable rows={normalizedRows} />
					</div>
					<RecordsCards rows={normalizedRows} />
				</>
			) : null}
		</section>
	);
}

function WorkflowStats({ rows, total }: { rows: RecordRow[]; total: number }) {
	const approved = rows.filter((row) =>
		["approved", "accepted", "signed", "paid", "reconciled"].includes(row.status),
	).length;
	const pending = rows.filter((row) =>
		["draft", "submitted", "sent", "issued", "recorded"].includes(row.status),
	).length;
	const value = rows.reduce((sum, row) => sum + (row.amount ?? 0), 0);

	return (
		<div className="grid gap-3 md:grid-cols-3">
			<StatCard icon={FileText} label="Registros" value={String(total)} />
			<StatCard icon={CheckCircle2} label="Completados" value={String(approved)} />
			<StatCard icon={Banknote} label="Valor" value={formatCurrency(value, "COP")} />
			{pending > 0 ? (
				<p className="md:col-span-3 flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning)]">
					<FileCheck2 className="size-4" aria-hidden="true" />
					{pending} registros requieren revisión o aprobación.
				</p>
			) : null}
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof FileText;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-card">
			<div className="flex items-center gap-3">
				<div className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]">
					<Icon className="size-4" aria-hidden="true" />
				</div>
				<div>
					<p className="text-xs font-medium uppercase text-[var(--text-muted)]">{label}</p>
					<p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
				</div>
			</div>
		</div>
	);
}
export { deliveryRows, sesRows, invoiceRows, paymentRows } from "./workflow-record-rows";
