"use client";

import type { KitTemplate } from "@cermont/shared-types";
import { Archive, CheckCircle2, Package2, Trash2 } from "lucide-react";
import { KIT_ACTIVITY_LABELS, KIT_STATUS_LABELS } from "@/modules/kits/constants";

const STATUS_STYLES: Record<string, string> = {
	draft: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
	active: "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
	archived:
		"bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-medium)]/30",
	voided: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/15",
};

type PendingMutation = "activate" | "archive" | "delete" | undefined;

interface KitCardProps {
	kit: KitTemplate;
	canManage: boolean;
	canPublish: boolean;
	onActivate: (id: string) => void;
	onArchive: (id: string) => void;
	onDelete: (id: string) => void;
	pendingMutation: PendingMutation;
}

export function KitCard({
	kit,
	canManage,
	canPublish,
	onActivate,
	onArchive,
	onDelete,
	pendingMutation,
}: KitCardProps) {
	const itemCount =
		(kit.tools?.length ?? 0) +
		(kit.electricalTools?.length ?? 0) +
		(kit.constructionEquipment?.length ?? 0) +
		(kit.materials?.length ?? 0) +
		(kit.epp?.length ?? 0);

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<div className="rounded-[var(--radius-md)] bg-[var(--color-info-bg)] p-1.5">
							<Package2 aria-hidden="true" className="size-4 text-[var(--color-info)]" />
						</div>
						<h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
							{kit.name}
						</h3>
					</div>
					<p className="mt-2 text-xs text-[var(--text-secondary)]">
						{KIT_ACTIVITY_LABELS[kit.activityType] ?? kit.activityType}
					</p>
					<p className="mt-1 text-xs text-[var(--text-tertiary)]">
						{itemCount} ítem(s) · v{kit.version}
					</p>
				</div>
				<span
					className={`inline-flex shrink-0 rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${STATUS_STYLES[kit.status] ?? ""}`}
				>
					{KIT_STATUS_LABELS[kit.status] ?? kit.status}
				</span>
			</div>

			{kit.description ? (
				<p className="mt-3 line-clamp-2 text-sm text-[var(--text-secondary)]">{kit.description}</p>
			) : null}

			<div className="mt-4 flex items-center gap-2">
				{canPublish && kit.status === "draft" ? (
					<button
						type="button"
						onClick={() => onActivate(kit._id)}
						className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-success)] hover:text-[var(--color-success)]/80 transition-colors"
						disabled={pendingMutation === "activate"}
					>
						<CheckCircle2 aria-hidden="true" className="size-3.5" />
						Activar
					</button>
				) : null}
				{canPublish && kit.status === "active" ? (
					<button
						type="button"
						onClick={() => onArchive(kit._id)}
						className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
						disabled={pendingMutation === "archive"}
					>
						<Archive aria-hidden="true" className="size-3.5" />
						Archivar
					</button>
				) : null}
				{canManage && kit.status === "draft" ? (
					<button
						type="button"
						onClick={() => onDelete(kit._id)}
						className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 transition-colors"
						disabled={pendingMutation === "delete"}
					>
						<Trash2 aria-hidden="true" className="size-3.5" />
						Eliminar
					</button>
				) : null}
			</div>
		</article>
	);
}
