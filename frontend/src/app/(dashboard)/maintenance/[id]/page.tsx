"use client";

import { hasRole } from "@cermont/domain";
import type { KitTemplate } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	CheckCircle2,
	FileText,
	HardHat,
	Loader2,
	Package,
	Package2,
	ShieldCheck,
	Wrench,
} from "lucide-react";
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
import { KitAttachmentsSection } from "@/modules/kits/ui/KitAttachmentsSection";
import { KitDetailHero } from "@/modules/kits/ui/KitDetailHero";
import { KitItemSectionCard } from "@/modules/kits/ui/KitItemSectionCard";
import { KitMetadataCard } from "@/modules/kits/ui/KitMetadataCard";

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
			<KitDetailHero
				kit={kit}
				canManage={canManage}
				isDeleting={deleteMutation.isPending}
				onActivate={handleActivate}
				onArchive={handleArchive}
				onDelete={handleDelete}
				onDuplicate={handleDuplicate}
				onRestore={handleRestore}
			/>

			{/* Metadata Cards */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<KitMetadataCard label="Estado" value={KIT_STATUS_LABELS[kit.status] ?? kit.status} />
				<KitMetadataCard
					label="Actividad"
					value={KIT_ACTIVITY_LABELS[kit.activityType] ?? kit.activityType}
				/>
				<KitMetadataCard
					label="Riesgo"
					value={kit.riskLevel ? (KIT_RISK_LABELS[kit.riskLevel] ?? kit.riskLevel) : "No definido"}
				/>
				<KitMetadataCard label="Versión" value={`v${kit.version}`} />
				<KitMetadataCard label="Elementos totales" value={String(totalItems)} />
				<KitMetadataCard
					label="Uso histórico"
					value={
						kit.usageCount ? `${kit.usageCount} vez${kit.usageCount !== 1 ? "es" : ""}` : "Sin uso"
					}
				/>
				<KitMetadataCard label="Creado" value={createdAt} />
				<KitMetadataCard label="Actualizado" value={updatedAt} />
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
					{itemSections.map((section) => (
						<KitItemSectionCard
							key={section.label}
							label={section.label}
							items={section.items}
							icon={section.icon}
						/>
					))}
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
				<KitAttachmentsSection attachments={kit.attachments} />
			) : null}

			{/* Documents & Checklists */}
			<DocumentsChecklistsSection kit={kit} />
		</section>
	);
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

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
