"use client";

import { hasRole } from "@cermont/domain";
import type { KitTemplate } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	Archive,
	ArrowLeft,
	CheckCircle2,
	Copy,
	FileText,
	HardHat,
	Loader2,
	Package,
	Package2,
	PencilLine,
	ShieldCheck,
	Trash2,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	KIT_ACTIVITY_LABELS,
	KIT_MANAGE_ROLES,
	KIT_RISK_LABELS,
	KIT_STATUS_LABELS,
} from "@/modules/kits/constants";
import {
	useActivateKit,
	useArchiveKit,
	useDeleteKit,
	useDuplicateKit,
	useKitDetail,
	useRestoreKit,
} from "@/modules/kits/hooks/useKits";

export default function MaintenanceKitDetailPage() {
	const params = useParams();
	const { push, refresh } = useRouter();
	const id = params.id as string;

	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canManage = hasRole(role, KIT_MANAGE_ROLES);

	const { data: kit, isLoading, error } = useKitDetail(id);
	const deleteMutation = useDeleteKit();
	const archiveMutation = useArchiveKit();
	const restoreMutation = useRestoreKit();
	const activateMutation = useActivateKit();
	const duplicateMutation = useDuplicateKit();

	if (isLoading) {
		return (
			<section className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)]">
				<div className="flex items-center gap-2 text-[var(--text-secondary)]">
					<Loader2 className="size-5 animate-spin" />
					Cargando detalle del kit…
				</div>
			</section>
		);
	}

	if (error || !kit) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)] px-6 py-5 text-sm text-[var(--color-danger)]">
				No se pudo cargar el kit. {(error as Error)?.message}
			</section>
		);
	}

	const handleDelete = async () => {
		const confirmed = window.confirm(`¿Eliminar el kit "${kit.name}"?`);
		if (!confirmed) {
			return;
		}
		try {
			const result = await deleteMutation.mutateAsync(kit._id);
			if (result.data?.deleted) {
				toast.success("Kit eliminado correctamente.");
			} else {
				toast.info(result.data?.message ?? "Kit archivado para mantener trazabilidad.");
			}
			push("/maintenance");
			refresh();
		} catch {
			toast.error("No se pudo eliminar el kit.");
		}
	};

	const handleArchive = async () => {
		const reason = window.prompt(`Motivo para archivar "${kit.name}":`);
		if (!reason?.trim()) {
			return;
		}
		try {
			await archiveMutation.mutateAsync({ id: kit._id, reason: reason.trim() });
			toast.success("Kit archivado correctamente.");
			push("/maintenance");
			refresh();
		} catch {
			toast.error("No se pudo archivar el kit.");
		}
	};

	const handleRestore = async () => {
		try {
			await restoreMutation.mutateAsync(kit._id);
			toast.success("Kit restaurado correctamente.");
			refresh();
		} catch {
			toast.error("No se pudo restaurar el kit.");
		}
	};

	const handleActivate = async () => {
		try {
			await activateMutation.mutateAsync(kit._id);
			toast.success("Kit activado correctamente.");
			refresh();
		} catch {
			toast.error("No se pudo activar el kit.");
		}
	};

	const handleDuplicate = async () => {
		try {
			const dup = await duplicateMutation.mutateAsync(kit._id);
			toast.success(`Kit duplicado como "${dup.name}".`);
			refresh();
		} catch {
			toast.error("No se pudo duplicar el kit.");
		}
	};

	const updatedAt = kit.updatedAt
		? format(new Date(kit.updatedAt), "dd MMM yyyy, HH:mm", { locale: es })
		: "";
	const createdAt = kit.createdAt
		? format(new Date(kit.createdAt), "dd MMM yyyy, HH:mm", { locale: es })
		: "";

	const itemSections = [
		{ label: "Herramientas", items: kit.tools, icon: Wrench, color: "blue" },
		{ label: "Herramientas Eléctricas", items: kit.electricalTools, icon: Wrench, color: "amber" },
		{
			label: "Equipos de Construcción",
			items: kit.constructionEquipment,
			icon: Package,
			color: "emerald",
		},
		{ label: "Kit de Alturas", items: kit.heightSafetyKit, icon: ShieldCheck, color: "sky" },
		{ label: "Materiales", items: kit.materials, icon: Package2, color: "orange" },
		{ label: "EPP", items: kit.epp, icon: HardHat, color: "green" },
		{ label: "Instrumentos", items: kit.instruments, icon: Wrench, color: "purple" },
		{ label: "Vehículos", items: kit.vehicles, icon: Package, color: "slate" },
	].filter((s) => s.items && s.items.length > 0);

	const totalItems = itemSections.reduce((sum, s) => sum + (s.items?.length ?? 0), 0);

	return (
		<section className="space-y-6" aria-labelledby="kit-detail-title">
			{/* Hero */}
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
						<h1 id="kit-detail-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
							{kit.name}
						</h1>
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
								onClick={handleActivate}
								className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
							>
								<CheckCircle2 className="size-4" />
								Activar kit
							</button>
						) : null}
						{canManage && kit.status === "archived" ? (
							<button
								type="button"
								onClick={handleRestore}
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
								onClick={handleDuplicate}
								className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
							>
								<Copy className="size-4" />
								Duplicar
							</button>
						) : null}
						{canManage && kit.status !== "archived" && kit.status !== "voided" ? (
							<button
								type="button"
								onClick={handleArchive}
								className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
							>
								<Archive className="size-4" />
								Archivar
							</button>
						) : null}
						{canManage && (kit.status === "draft" || kit.status === "active") ? (
							<button
								type="button"
								onClick={handleDelete}
								disabled={deleteMutation.isPending}
								className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{deleteMutation.isPending ? (
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

			{/* Metadata Cards */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<MetadataCard label="Estado" value={KIT_STATUS_LABELS[kit.status] ?? kit.status} />
				<MetadataCard
					label="Actividad"
					value={KIT_ACTIVITY_LABELS[kit.activityType] ?? kit.activityType}
				/>
				<MetadataCard
					label="Riesgo"
					value={kit.riskLevel ? (KIT_RISK_LABELS[kit.riskLevel] ?? kit.riskLevel) : "No definido"}
				/>
				<MetadataCard label="Versión" value={`v${kit.version}`} />
				<MetadataCard label="Elementos totales" value={String(totalItems)} />
				<MetadataCard
					label="Uso histórico"
					value={
						kit.usageCount ? `${kit.usageCount} vez${kit.usageCount !== 1 ? "es" : ""}` : "Sin uso"
					}
				/>
				<MetadataCard label="Creado" value={createdAt} />
				<MetadataCard label="Actualizado" value={updatedAt} />
			</div>

			{/* Tags */}
			{kit.tags && kit.tags.length > 0 ? (
				<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5">
					<h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Etiquetas</h2>
					<div className="flex flex-wrap gap-2">
						{kit.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-[var(--radius-full)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
							>
								{tag}
							</span>
						))}
					</div>
				</section>
			) : null}

			{/* Item Sections */}
			{itemSections.length > 0 ? (
				<div className="grid gap-6 xl:grid-cols-2">
					{itemSections.map((section) => {
						const Icon = section.icon;
						return (
							<section
								key={section.label}
								className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5"
							>
								<div className="flex items-center gap-3">
									<Icon className="size-5 text-[var(--color-brand)]" />
									<div>
										<h2 className="text-lg font-semibold text-[var(--text-primary)]">
											{section.label}
										</h2>
										<p className="text-sm text-[var(--text-secondary)]">
											{section.items.length} ítem(s) configurado(s)
										</p>
									</div>
								</div>

								<div className="mt-4 space-y-2">
									{section.items.map((item) => (
										<article
											key={(item as { id?: string }).id ?? item.name}
											className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3"
										>
											<div className="min-w-0 flex-1">
												<p className="font-medium text-[var(--text-primary)]">{item.name}</p>
												{item.description ? (
													<p className="text-xs text-[var(--text-tertiary)]">{item.description}</p>
												) : null}
											</div>
											<div className="flex shrink-0 items-center gap-3 text-xs">
												<span className="font-semibold text-[var(--text-secondary)]">
													{item.quantity} {item.unit}
												</span>
												{item.isCritical ? (
													<span className="rounded-[var(--radius-full)] bg-[var(--color-danger-bg)] px-2 py-0.5 font-semibold text-[var(--color-danger)]">
														Crítico
													</span>
												) : null}
												{item.isOptional ? (
													<span className="rounded-[var(--radius-full)] bg-[var(--surface-secondary)] px-2 py-0.5 text-[var(--text-tertiary)]">
														Opcional
													</span>
												) : null}
											</div>
										</article>
									))}
								</div>
							</section>
						);
					})}
				</div>
			) : (
				<section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-medium)] bg-[var(--surface-primary)] px-6 py-8 text-center">
					<p className="text-sm text-[var(--text-secondary)]">
						Este kit no tiene elementos configurados. Edita el kit para agregar herramientas,
						materiales, EPP y más.
					</p>
				</section>
			)}

			{/* Attachments */}
			{kit.attachments && kit.attachments.length > 0 ? (
				<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
						<FileText className="size-5" />
						Documentos adjuntos ({kit.attachments.length})
					</h2>
					<div className="mt-4 space-y-2">
						{kit.attachments.map((att) => (
							<article
								key={att.id}
								className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3"
							>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-[var(--text-primary)]">{att.originalName}</p>
									<p className="text-xs text-[var(--text-tertiary)]">
										{att.purpose} · {(att.fileSize / 1024).toFixed(1)} KB
									</p>
								</div>
								{att.url ? (
									<a
										href={att.url}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-[var(--radius-full)] bg-[var(--color-brand)] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-hover)]"
									>
										Ver
									</a>
								) : null}
							</article>
						))}
					</div>
				</section>
			) : null}

			{/* Documents & Checklists */}
			<DocumentsChecklistsSection kit={kit} />
		</section>
	);
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function MetadataCard({ label, value }: { label: string; value: string }) {
	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 shadow-[var(--shadow-card)]">
			<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
				{label}
			</p>
			<p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
		</article>
	);
}

function DocumentsChecklistsSection({ kit }: { kit: KitTemplate }) {
	const hasDocs = kit.documents && kit.documents.length > 0;
	const hasChecklists = kit.checklists && kit.checklists.length > 0;

	if (!hasDocs && !hasChecklists) {
		return null;
	}

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5">
			<h2 className="text-lg font-semibold text-[var(--text-primary)]">Documentos y Checklists</h2>
			<div className="mt-4 grid gap-6 sm:grid-cols-2">
				{hasDocs ? (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">
							Documentos Requeridos ({kit.documents.length})
						</h3>
						<ul className="space-y-2">
							{kit.documents.map((doc) => (
								<li
									key={(doc as { id?: string }).id ?? doc.name}
									className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
								>
									<FileText className="size-4 shrink-0 text-[var(--text-tertiary)]" />
									<span>{doc.name}</span>
									{doc.isRequired ? (
										<span className="ml-auto text-xs font-semibold text-[var(--color-danger)]">
											Requerido
										</span>
									) : null}
								</li>
							))}
						</ul>
					</div>
				) : null}
				{hasChecklists ? (
					<div>
						<h3 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">
							Checklists ({kit.checklists.length})
						</h3>
						<ul className="space-y-2">
							{kit.checklists.map((cl) => (
								<li
									key={(cl as { id?: string }).id ?? cl.name}
									className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
								>
									<CheckCircle2 className="size-4 shrink-0 text-[var(--color-success)]" />
									<span>{cl.name}</span>
									<span className="ml-auto text-xs text-[var(--text-tertiary)]">{cl.stage}</span>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>
		</section>
	);
}
