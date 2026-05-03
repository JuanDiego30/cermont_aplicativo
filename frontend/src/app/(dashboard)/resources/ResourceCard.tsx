"use client";

import Link from "next/link";
import { Button } from "@/core/ui/Button";
import {
	RESOURCE_TYPE_LABELS,
	STATUS_DISPLAY,
	STATUS_STYLES,
	UNIT_LABELS,
} from "./resource-constants";

interface ResourceCardProps {
	resource: {
		_id?: string;
		name?: string;
		type?: string;
		unit?: string;
		totalInstances?: number;
		availableInstances?: number;
		primaryStatus?: string;
	};
}

export function ResourceCard({ resource }: ResourceCardProps) {
	const name = resource.name ?? "";
	const type = resource.type ?? "";
	const unit = resource.unit ?? "";
	const totalInstances = resource.totalInstances ?? 0;
	const availableInstances = resource.availableInstances ?? 0;
	const primaryStatus = resource.primaryStatus ?? "";
	const _id = resource._id ?? "";

	const availabilityPercentage =
		totalInstances > 0 ? Math.round((availableInstances / totalInstances) * 100) : 0;

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="truncate text-base font-semibold text-[var(--text-primary)]">{name}</h3>
					<p className="mt-1 text-xs text-[var(--text-secondary)]">
						{RESOURCE_TYPE_LABELS[type] ?? type} • {UNIT_LABELS[unit] ?? unit}
					</p>
				</div>
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${STATUS_STYLES[primaryStatus] ?? "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-default)]"}`}
				>
					{STATUS_DISPLAY[primaryStatus] ?? primaryStatus.replaceAll("_", " ")}
				</span>
			</div>

			<div className="mt-4 space-y-3">
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="rounded-lg bg-[var(--surface-secondary)] px-3 py-2">
						<p className="text-xs text-[var(--text-tertiary)]">Instancias</p>
						<p className="mt-1 font-semibold text-[var(--text-primary)]">{totalInstances}</p>
					</div>
					<div className="rounded-lg bg-[var(--surface-secondary)] px-3 py-2">
						<p className="text-xs text-[var(--text-tertiary)]">Disponibles</p>
						<p className="mt-1 font-semibold text-[var(--color-success)]">{availableInstances}</p>
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
					<Link href={`/resources/${_id}`}>Ver detalle</Link>
				</Button>
			</div>
		</article>
	);
}
