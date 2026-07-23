"use client";

import {
	AUDIT_ACTIONS,
	type AuditAction,
	type AuditJsonValue,
	type AuditLogRecord,
} from "@cermont/shared-types";
import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	Filter,
	RotateCcw,
	ScrollText,
	ShieldCheck,
	WifiOff,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { BadgePill } from "@/core/ui/BadgePill";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { useOfflineStore } from "@/store/offline.store";
import type { AuditListFilters } from "../api";
import { useAuditLogsQuery } from "../queries";

const DEFAULT_FILTERS: AuditListFilters = {
	page: 1,
	limit: 25,
};

const OBJECT_ID_PATTERN = "[0-9a-fA-F]{24}";
const ACTION_OPTIONS = Object.values(AUDIT_ACTIONS).sort((a, b) => a.localeCompare(b));
const AUDIT_SKELETON_KEYS = ["audit-first", "audit-second", "audit-third", "audit-fourth"];

function toStartOfDay(value: string): string {
	return `${value}T00:00:00.000Z`;
}

function toEndOfDay(value: string): string {
	return `${value}T23:59:59.999Z`;
}

function actionLabel(action: string): string {
	return action
		.toLowerCase()
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function auditEventClasses(action: string): { card: string; badge: string; dot: string } {
	const value = action.toUpperCase();
	if (/(REJECT|FAIL)/.test(value)) {
		return {
			card: "border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)]/30",
			badge: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
			dot: "bg-[var(--color-warning)]",
		};
	}
	if (/(DELETE|DEACTIVATE|REVOKE|CANCEL|ARCHIVE)/.test(value)) {
		return {
			card: "border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]/30",
			badge: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
			dot: "bg-[var(--color-danger)]",
		};
	}
	if (/(CREATE|REGISTER|UPLOAD|ISSUE|APPROVE|SIGN|PAY)/.test(value)) {
		return {
			card: "border-[var(--color-success)]/30 bg-[var(--color-success-bg)]/30",
			badge: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
			dot: "bg-[var(--color-success)]",
		};
	}
	if (/(UPDATE|EDIT|ASSIGN|ADVANCE|START|SUBMIT|COMPLETE|PAUSE)/.test(value)) {
		return {
			card: "border-[var(--color-info)]/30 bg-[var(--color-info-bg)]/30",
			badge: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
			dot: "bg-[var(--color-info)]",
		};
	}
	return {
		card: "border-[var(--border-subtle)] bg-[var(--surface-primary)]",
		badge: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]",
		dot: "bg-[var(--text-tertiary)]",
	};
}

function formatTimestamp(value: string): string {
	return new Intl.DateTimeFormat("es-CO", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "America/Bogota",
	}).format(new Date(value));
}

function DetailBlock({ label, value }: { label: string; value: AuditJsonValue }) {
	return (
		<div>
			<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
				{label}
			</p>
			<pre className="max-h-64 overflow-auto rounded-[var(--radius-lg)] bg-zinc-950 p-3 text-xs leading-5 text-muted-text">
				{JSON.stringify(value)}
			</pre>
		</div>
	);
}

function AuditEventDetails({ event }: { event: AuditLogRecord }) {
	if (!event.changes && event.metadata === undefined) {
		return null;
	}

	return (
		<details className="mt-3 border-t border-[var(--border-subtle)] pt-3">
			<summary className="cursor-pointer text-xs font-medium text-[var(--color-brand-blue)]">
				Ver cambios y contexto
			</summary>
			<div className="mt-3 grid gap-3 lg:grid-cols-2">
				{event.changes?.before !== undefined ? (
					<DetailBlock label="Antes" value={event.changes.before} />
				) : null}
				{event.changes?.after !== undefined ? (
					<DetailBlock label="Después" value={event.changes.after} />
				) : null}
				{event.metadata !== undefined ? (
					<DetailBlock label="Metadatos" value={event.metadata} />
				) : null}
			</div>
		</details>
	);
}

function AuditEventCard({ event }: { event: AuditLogRecord }) {
	const semanticStyle = auditEventClasses(event.action);
	return (
		<article className={`rounded-[var(--radius-xl)] border p-4 shadow-card ${semanticStyle.card}`}>
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<BadgePill className={semanticStyle.badge} dotClassName={semanticStyle.dot}>
							{actionLabel(event.action)}
						</BadgePill>
						<span className="text-xs text-[var(--text-tertiary)]">{event.entityType}</span>
					</div>
					<p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{event.userEmail}</p>
					<p className="mt-0.5 break-all font-mono text-xs text-[var(--text-tertiary)]">
						{event.entityId}
					</p>
				</div>
				<time className="text-xs text-[var(--text-secondary)]" dateTime={event.createdAt}>
					{formatTimestamp(event.createdAt)}
				</time>
			</header>

			<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
				{event.requestId ? <span>Request: {event.requestId}</span> : null}
				{event.ipAddress ? <span>IP: {event.ipAddress}</span> : null}
			</div>
			<AuditEventDetails event={event} />
		</article>
	);
}

interface FilterDraft {
	entity: string;
	entityId: string;
	userId: string;
	requestId: string;
	action: string;
	from: string;
	to: string;
}

const EMPTY_DRAFT: FilterDraft = {
	entity: "",
	entityId: "",
	userId: "",
	requestId: "",
	action: "",
	from: "",
	to: "",
};

export function AuditLogViewer() {
	const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
	const [filters, setFilters] = useState<AuditListFilters>(DEFAULT_FILTERS);
	const isOnline = useOfflineStore((state) => state.isOnline);
	const query = useAuditLogsQuery(filters);

	function updateDraft(field: keyof FilterDraft, value: string): void {
		setDraft((current) => ({ ...current, [field]: value }));
	}

	function applyFilters(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setFilters({
			page: 1,
			limit: filters.limit,
			...(draft.entity.trim() ? { entity: draft.entity.trim() } : {}),
			...(draft.entityId.trim() ? { entityId: draft.entityId.trim() } : {}),
			...(draft.userId.trim() ? { userId: draft.userId.trim() } : {}),
			...(draft.requestId.trim() ? { requestId: draft.requestId.trim() } : {}),
			...(draft.action ? { action: draft.action as AuditAction } : {}),
			...(draft.from ? { from: toStartOfDay(draft.from) } : {}),
			...(draft.to ? { to: toEndOfDay(draft.to) } : {}),
		});
	}

	function resetFilters(): void {
		setDraft(EMPTY_DRAFT);
		setFilters(DEFAULT_FILTERS);
	}

	function goToPage(page: number): void {
		setFilters((current) => ({ ...current, page }));
	}

	const events = query.data?.events ?? [];
	const pagination = query.data?.pagination;

	return (
		<section className="space-y-6" aria-labelledby="audit-title">
			<header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<div className="mb-2 flex items-center gap-2 text-[var(--color-brand-blue)]">
						<ShieldCheck className="size-5" aria-hidden="true" />
						<span className="text-xs font-semibold uppercase tracking-[0.16em]">
							Trazabilidad forense
						</span>
					</div>
					<h1 id="audit-title" className="text-2xl font-semibold text-[var(--text-primary)]">
						Registro de auditoría
					</h1>
					<p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
						Consulta acciones críticas, transiciones del flujo, actor y correlación técnica.
					</p>
				</div>
				{!isOnline ? (
					<BadgePill
						leadingIcon={<WifiOff className="size-3.5" />}
						className="bg-warning-bg text-brand-warn ring-amber-200"
					>
						Mostrando caché disponible
					</BadgePill>
				) : null}
			</header>

			<form
				onSubmit={applyFilters}
				className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card"
				aria-label="Filtros de auditoría"
			>
				<div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
					<Filter className="size-4" aria-hidden="true" />
					Filtros
				</div>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)]">
						Acción
						<select
							value={draft.action}
							onChange={(event) => updateDraft("action", event.target.value)}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
						>
							<option value="">Todas</option>
							{ACTION_OPTIONS.map((action) => (
								<option key={action} value={action}>
									{actionLabel(action)}
								</option>
							))}
						</select>
					</label>
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)]">
						Recurso
						<input
							value={draft.entity}
							onChange={(event) => updateDraft("entity", event.target.value)}
							placeholder="ServiceCase, Order..."
							maxLength={100}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
						/>
					</label>
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)]">
						Desde
						<input
							type="date"
							value={draft.from}
							onChange={(event) => updateDraft("from", event.target.value)}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
						/>
					</label>
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)]">
						Hasta
						<input
							type="date"
							{...(draft.from ? { min: draft.from } : {})}
							value={draft.to}
							onChange={(event) => updateDraft("to", event.target.value)}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
						/>
					</label>
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)]">
						ID del usuario
						<input
							value={draft.userId}
							onChange={(event) => updateDraft("userId", event.target.value)}
							pattern={OBJECT_ID_PATTERN}
							title="Debe ser un ObjectId de 24 caracteres hexadecimales"
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 font-mono text-sm text-[var(--text-primary)]"
						/>
					</label>
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)]">
						ID del recurso
						<input
							value={draft.entityId}
							onChange={(event) => updateDraft("entityId", event.target.value)}
							pattern={OBJECT_ID_PATTERN}
							title="Debe ser un ObjectId de 24 caracteres hexadecimales"
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 font-mono text-sm text-[var(--text-primary)]"
						/>
					</label>
					<label className="space-y-1 text-xs font-medium text-[var(--text-secondary)] md:col-span-2">
						Request ID
						<input
							value={draft.requestId}
							onChange={(event) => updateDraft("requestId", event.target.value)}
							maxLength={128}
							pattern="[A-Za-z0-9][A-Za-z0-9._:-]*"
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 font-mono text-sm text-[var(--text-primary)]"
						/>
					</label>
				</div>
				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="ghost" onClick={resetFilters}>
						<RotateCcw aria-hidden="true" />
						Limpiar
					</Button>
					<Button type="submit" variant="primary">
						<Filter aria-hidden="true" />
						Aplicar filtros
					</Button>
				</div>
			</form>

			{query.isLoading ? (
				<div className="space-y-3" aria-live="polite">
					<Skeleton variant="text" className="h-6 w-48" />
					{AUDIT_SKELETON_KEYS.map((key) => (
						<Skeleton key={key} variant="card" height={150} />
					))}
				</div>
			) : query.error ? (
				<ErrorFallback
					error={query.error}
					title="No fue posible cargar la auditoría"
					description={
						isOnline
							? "Revisa la conexión con el backend e inténtalo nuevamente."
							: "La auditoría requiere conexión y no hay una copia en caché disponible."
					}
					resetErrorBoundary={() => query.refetch()}
				/>
			) : events.length === 0 ? (
				<EmptyState
					icon={ScrollText}
					title="Sin eventos para estos filtros"
					description="Ajusta el período, recurso o acción para ampliar la búsqueda."
					action={{ label: "Limpiar filtros", onClick: resetFilters }}
				/>
			) : (
				<>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-[var(--text-secondary)]" aria-live="polite">
							{pagination?.total.toLocaleString("es-CO")} eventos encontrados
						</p>
						<div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
							<CalendarDays className="size-4" aria-hidden="true" />
							Ordenados del más reciente al más antiguo
						</div>
					</div>
					<div className="space-y-3">
						{events.map((event) => (
							<AuditEventCard key={event._id} event={event} />
						))}
					</div>
					<nav
						className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3"
						aria-label="Paginación de auditoría"
					>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={!pagination || pagination.page <= 1}
							onClick={() => goToPage((pagination?.page ?? 1) - 1)}
						>
							<ChevronLeft aria-hidden="true" />
							Anterior
						</Button>
						<span className="text-xs text-[var(--text-secondary)]">
							Página {pagination?.page ?? 1} de {pagination?.totalPages ?? 1}
						</span>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							disabled={!pagination || pagination.page >= pagination.totalPages}
							onClick={() => goToPage((pagination?.page ?? 1) + 1)}
						>
							Siguiente
							<ChevronRight aria-hidden="true" />
						</Button>
					</nav>
				</>
			)}
		</section>
	);
}
