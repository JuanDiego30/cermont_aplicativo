"use client";

import {
	AlertTriangle,
	ArrowRight,
	CalendarClock,
	MapPin,
	RefreshCw,
	Search,
	UploadCloud,
	WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useConnectivity } from "@/lib/offline/connectivity";
import { APP_ROUTES } from "@/lib/routes";
import { useSiteVisitsList } from "@/modules/site-visits/queries";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Sin fecha";
	}
	return dateFormatter.format(date);
}

function statusTone(status: string): string {
	if (status === "completed") {
		return "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]";
	}
	if (status === "cancelled") {
		return "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]";
	}
	if (status === "in_progress") {
		return "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]";
	}
	return "border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]";
}

export default function SiteVisitsPage() {
	const { data, isLoading, isError, refetch } = useSiteVisitsList();
	const { isOnline } = useConnectivity();
	const items = data?.items ?? [];

	return (
		<section className="space-y-6" aria-labelledby="site-visits-title">
			<header className="space-y-4">
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 2 / Operación</p>
					<h1
						id="site-visits-title"
						className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Visitas técnicas
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Registro de visitas previas a propuesta o ejecución, incluyendo mediciones, hallazgos,
						registro fotográfico y recomendaciones.
					</p>
				</div>
				<nav className="flex flex-wrap gap-2" aria-label="Acciones de visitas">
					<Link
						href={APP_ROUTES.siteVisitNew}
						className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-card transition-colors hover:bg-[var(--surface-secondary)]"
					>
						Nueva visita
						<ArrowRight className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					</Link>
				</nav>
			</header>

			{!isOnline ? (
				<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-4 text-sm text-[var(--color-warning)]">
					<WifiOff className="mt-0.5 size-4" aria-hidden="true" />
					<p>Estás sin conexión. La vista conserva el último estado consultado.</p>
				</div>
			) : null}

			<div className="grid gap-3 md:grid-cols-3">
				<StatCard icon={Search} label="Total" value={data?.total ?? 0} />
				<StatCard
					icon={CalendarClock}
					label="Programadas"
					value={items.filter((v) => v.status === "scheduled").length}
				/>
				<StatCard
					icon={MapPin}
					label="En campo"
					value={items.filter((v) => v.status === "in_progress").length}
				/>
			</div>

			{isLoading ? (
				<div className="grid gap-3">
					{[0, 1, 2].map((item) => (
						<div
							key={item}
							className="h-24 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]"
						/>
					))}
				</div>
			) : null}

			{isError ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<div className="flex items-start gap-3">
						<AlertTriangle
							className="mt-0.5 size-5 text-[var(--color-danger)]"
							aria-hidden="true"
						/>
						<div>
							<h2 className="text-base font-semibold text-[var(--text-primary)]">
								No se pudo cargar el módulo
							</h2>
							<p className="mt-1 text-sm text-[var(--text-secondary)]">
								El endpoint respondió con error o la sesión expiró.
							</p>
							<button
								type="button"
								onClick={() => refetch()}
								className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
							>
								<RefreshCw className="size-4" aria-hidden="true" />
								Reintentar
							</button>
						</div>
					</div>
				</div>
			) : null}

			{!isLoading && !isError && items.length === 0 ? (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<div className="flex items-start gap-4">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]">
							<UploadCloud className="size-5" aria-hidden="true" />
						</div>
						<div>
							<h2 className="text-base font-semibold text-[var(--text-primary)]">
								Sin visitas técnicas
							</h2>
							<p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
								Crea una visita técnica desde una solicitud de trabajo para registrar mediciones,
								hallazgos y fotos en campo.
							</p>
							<Link
								href={APP_ROUTES.siteVisitNew}
								className="mt-4 inline-flex rounded-[var(--radius-md)] bg-[var(--color-brand)] px-3 py-2 text-sm font-medium text-white"
							>
								Crear visita
							</Link>
						</div>
					</div>
				</div>
			) : null}

			{items.length > 0 ? (
				<>
					<div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-card md:block">
						<table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
							<thead className="bg-[var(--surface-secondary)] text-left text-xs uppercase text-[var(--text-muted)]">
								<tr>
									<th className="px-4 py-3 font-semibold">Código</th>
									<th className="px-4 py-3 font-semibold">Cliente</th>
									<th className="px-4 py-3 font-semibold">Ubicación</th>
									<th className="px-4 py-3 font-semibold">Estado</th>
									<th className="px-4 py-3 font-semibold">Fecha</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border-subtle)]">
								{items.map((visit) => (
									<tr key={visit._id}>
										<td className="px-4 py-3 font-medium text-[var(--text-primary)]">
											<Link href={`/site-visits/${visit._id}`}>{visit.code}</Link>
										</td>
										<td className="px-4 py-3 text-[var(--text-secondary)]">{visit.clientName}</td>
										<td className="px-4 py-3 text-[var(--text-secondary)]">{visit.location}</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(visit.status)}`}
											>
												{visit.status}
											</span>
										</td>
										<td className="px-4 py-3 text-[var(--text-secondary)]">
											{formatDate(visit.visitDate)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="grid gap-3 md:hidden">
						{items.map((visit) => (
							<article
								key={visit._id}
								className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-[var(--text-primary)]">{visit.code}</p>
										<p className="mt-1 text-xs text-[var(--text-secondary)]">{visit.clientName}</p>
									</div>
									<span
										className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusTone(visit.status)}`}
									>
										{visit.status}
									</span>
								</div>
								<div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
									<MapPin className="size-3" />
									<span>{visit.location}</span>
									<span className="text-[var(--border-default)]">|</span>
									<CalendarClock className="size-3" />
									<span>{formatDate(visit.visitDate)}</span>
								</div>
							</article>
						))}
					</div>
				</>
			) : null}
		</section>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Search;
	label: string;
	value: number;
}) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
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
