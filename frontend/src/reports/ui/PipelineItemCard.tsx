"use client";

import type { ReportPipelineItem } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileWarning, MapPin } from "lucide-react";
import { cn } from "@/_shared/lib/utils";
import { ReportStatusBadge } from "./ReportStatusBadge";

interface PipelineItemCardProps {
	item: ReportPipelineItem;
	isSelected: boolean;
	onSelect: () => void;
}

function getWaitingTone(daysWaiting: number): string {
	if (daysWaiting > 5) {
		return "text-[var(--color-danger)]";
	}

	if (daysWaiting > 2) {
		return "text-[var(--color-warning)]";
	}

	return "text-[var(--color-success)]";
}

function formatShortDate(value: string | null): string {
	if (!value) {
		return "Sin cierre";
	}

	return format(new Date(value), "dd MMM", { locale: es });
}

export function PipelineItemCard({ item, isSelected, onSelect }: PipelineItemCardProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={isSelected}
			className={cn(
				"w-full rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-[background-color,border-color,box-shadow,transform]",
				isSelected
					? "border-[color:var(--color-brand-blue)]/45 bg-[var(--color-info-bg)] shadow-[var(--shadow-1)]"
					: "border-[var(--border-default)] bg-[var(--surface-primary)] hover:border-[color:var(--color-brand-blue)]/35 hover:bg-[var(--surface-secondary)]",
			)}
		>
			<span className="flex items-start justify-between gap-3">
				<span className="min-w-0 flex-1">
					<span className="flex flex-wrap items-center gap-2">
						<span className="font-mono text-sm font-bold text-[var(--text-primary)]">
							{item.code}
						</span>
						<span className="rounded-full bg-[var(--surface-secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
							{item.type}
						</span>
					</span>
					<span className="mt-1 block truncate text-sm font-medium text-[var(--text-primary)]">
						{item.assetName}
					</span>
					<span className="mt-1 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
						<MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
						<span className="truncate">{item.location}</span>
					</span>
				</span>

				<span className="shrink-0 text-right">
					<span className={cn("block text-sm font-extrabold", getWaitingTone(item.daysWaiting))}>
						{item.daysWaiting}d
					</span>
					{item.reportStatus ? (
						<ReportStatusBadge status={item.reportStatus} />
					) : (
						<span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
							<FileWarning className="h-3 w-3" aria-hidden="true" />
							Sin informe
						</span>
					)}
				</span>
			</span>

			<span className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[var(--text-tertiary)]">
				<span className="truncate">Resp. {item.createdBy}</span>
				<span>{formatShortDate(item.completedAt)}</span>
			</span>
		</button>
	);
}
