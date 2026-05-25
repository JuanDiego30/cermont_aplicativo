"use client";

import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { RESOURCE_TYPE_LABELS, STATUS_STYLES, UNIT_LABELS } from "./resource-constants";

interface ResourceCardProps {
	resource: {
		_id?: string;
		nombre?: string;
		tipo?: string;
		totalInstancias?: number;
		instanciasDisponibles?: number;
		unidad?: string;
		moneda?: string;
		costo_unitario?: number;
		estado?: string;
		estadoPrincipal?: string;
	};
}

export function ResourceCard({ resource }: ResourceCardProps) {
	const totalInstancias = resource.totalInstancias ?? 0;
	const instanciasDisponibles = resource.instanciasDisponibles ?? 0;
	const estadoPrincipal = resource.estadoPrincipal ?? "";
	const availabilityPercentage =
		totalInstancias > 0 ? Math.round((instanciasDisponibles / totalInstancias) * 100) : 0;

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
						{resource.nombre}
					</h3>
					<p className="mt-1 text-xs text-[var(--text-secondary)]">
						{RESOURCE_TYPE_LABELS[resource.tipo ?? ""] ?? resource.tipo} •{" "}
						{UNIT_LABELS[resource.unidad ?? ""] ?? resource.unidad}
					</p>
				</div>
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${STATUS_STYLES[estadoPrincipal] ?? "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-default)]"}`}
				>
					{estadoPrincipal.replaceAll("_", " ")}
				</span>
			</div>

			<div className="mt-4 space-y-3">
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="rounded-lg bg-[var(--surface-secondary)] px-3 py-2">
						<p className="text-xs text-[var(--text-tertiary)]">Instancias</p>
						<p className="mt-1 font-semibold text-[var(--text-primary)]">{totalInstancias}</p>
					</div>
					<div className="rounded-lg bg-[var(--surface-secondary)] px-3 py-2">
						<p className="text-xs text-[var(--text-tertiary)]">Disponibles</p>
						<p className="mt-1 font-semibold text-[var(--color-success)]">
							{instanciasDisponibles}
						</p>
					</div>
				</div>

				<div>
					<div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
						<span>Disponibilidad</span>
						<span>{availabilityPercentage}%</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
						<div
							className="h-full rounded-full bg-[var(--color-brand-blue)]"
							style={{ width: `${availabilityPercentage}%` }}
						/>
					</div>
				</div>
			</div>

			<div className="mt-4">
				<Button asChild variant="outline" size="sm">
					<Link href={`/resources/${resource._id}`}>Ver detalle</Link>
				</Button>
			</div>
		</article>
	);
}
