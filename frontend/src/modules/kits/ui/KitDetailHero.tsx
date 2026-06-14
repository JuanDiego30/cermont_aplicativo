"use client";

import type { KitTemplate } from "@cermont/shared-types";
import { Archive, ArrowLeft, CheckCircle2, Copy, Loader2, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { KIT_ACTIVITY_LABELS, KIT_STATUS_LABELS } from "@/modules/kits/constants";

interface KitDetailHeroProps {
	kit: KitTemplate;
	canManage: boolean;
	isDeleting: boolean;
	onActivate: () => void;
	onArchive: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	onRestore: () => void;
}

export function KitDetailHero({
	kit,
	canManage,
	isDeleting,
	onActivate,
	onArchive,
	onDelete,
	onDuplicate,
	onRestore,
}: KitDetailHeroProps) {
	return (
		<header className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--color-cermont-blue-deep)] via-[var(--color-cermont-blue)] to-[var(--color-cermont-green-deep)] px-6 py-8 text-white shadow-[var(--shadow-modal)]">
			<div className="space-y-5">
				<Link
					href="/maintenance"
					className="inline-flex items-center gap-1 text-sm font-medium text-white/75 transition hover:text-white"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver al catálogo
				</Link>

				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{kit.name}</h1>
					<span className="rounded-[var(--radius-full)] bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
						{KIT_ACTIVITY_LABELS[kit.activityType] ?? kit.activityType}
					</span>
					<span
						className={`rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
							kit.status === "active"
								? "bg-emerald-400/15 text-emerald-200"
								: kit.status === "draft"
									? "bg-amber-400/15 text-amber-200"
									: "bg-zinc-500/20 text-zinc-200"
						}`}
					>
						{KIT_STATUS_LABELS[kit.status] ?? kit.status}
					</span>
				</div>

				<p className="max-w-3xl text-sm leading-6 text-white/75">
					{kit.description ?? "Kit reutilizable para planeación y ejecución."}
				</p>

				{/* Actions */}
				<div className="flex flex-wrap gap-3">
					{canManage && kit.status === "draft" ? (
						<button
							type="button"
							onClick={onActivate}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
						>
							<CheckCircle2 className="size-4" />
							Activar kit
						</button>
					) : null}
					{canManage && kit.status === "archived" ? (
						<button
							type="button"
							onClick={onRestore}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/25"
						>
							Restaurar kit
						</button>
					) : null}
					{canManage && kit.status !== "voided" ? (
						<Link
							href={`/maintenance/${kit._id}/edit`}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
						>
							<PencilLine className="size-4" />
							Editar
						</Link>
					) : null}
					{canManage ? (
						<button
							type="button"
							onClick={onDuplicate}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
						>
							<Copy className="size-4" />
							Duplicar
						</button>
					) : null}
					{canManage && kit.status !== "archived" && kit.status !== "voided" ? (
						<button
							type="button"
							onClick={onArchive}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
						>
							<Archive className="size-4" />
							Archivar
						</button>
					) : null}
					{canManage && (kit.status === "draft" || kit.status === "active") ? (
						<button
							type="button"
							onClick={onDelete}
							disabled={isDeleting}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isDeleting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Trash2 className="size-4" />
							)}
							Eliminar
						</button>
					) : null}
				</div>
			</div>
		</header>
	);
}
