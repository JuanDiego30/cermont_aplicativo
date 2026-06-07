"use client";

/**
 * ResourceCard — Card for a single resource in the list view
 *
 * Displays resource name, type, unit, status, and image preview.
 * Links to the full detail page.
 */

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/core/ui/Button";
import {
	RESOURCE_TYPE_LABELS,
	STATUS_LABELS,
	STATUS_STYLES,
	UNIT_LABELS,
} from "./resource-constants";

interface ResourceCardResource {
	_id: string;
	name: string;
	type: string;
	unit?: string;
	defaultQuantity?: number;
	status?: string;
	active?: boolean;
	images?: Array<{ id: string; url: string; originalName?: string }>;
}

interface ResourceCardProps {
	resource: ResourceCardResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
	const statusKey = resource.status ?? "available";
	const unitLabel = resource.unit ? (UNIT_LABELS[resource.unit] ?? resource.unit) : "";
	const typeLabel = RESOURCE_TYPE_LABELS[resource.type] ?? resource.type;
	const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
						{resource.name}
					</h3>
					<p className="mt-1 text-xs text-[var(--text-secondary)]">
						{typeLabel}
						{unitLabel ? <> • {unitLabel}</> : null}
						{resource.defaultQuantity && resource.defaultQuantity > 1
							? ` • ${resource.defaultQuantity} ${unitLabel ?? "unid."}`
							: null}
					</p>
				</div>
				<span
					className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${STATUS_STYLES[statusKey] ?? "bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[var(--border-default)]"}`}
				>
					{statusLabel}
				</span>
			</div>

			{/* Image thumbnail if available */}
			{resource.images && resource.images.length > 0 ? (
				<div className="mt-3 flex gap-2">
					{resource.images.slice(0, 3).map((img) => (
						<div
							key={img.id}
							className="size-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)]"
						>
							<Image
								src={img.url}
								alt={img.originalName ?? ""}
								fill
								sizes="48px"
								className="object-cover"
								unoptimized
							/>
						</div>
					))}
					{resource.images.length > 3 ? (
						<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--surface-secondary)] text-xs text-[var(--text-tertiary)]">
							+{resource.images.length - 3}
						</div>
					) : null}
				</div>
			) : null}

			<div className="mt-4">
				<Button asChild variant="outline" size="sm">
					<Link href={`/resources/${resource._id}`}>Ver detalle</Link>
				</Button>
			</div>
		</article>
	);
}
