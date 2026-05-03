"use client";

import { hasRole } from "@cermont/shared-types/rbac";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowLeft,
	CheckCircle2,
	Layers3,
	Loader2,
	Package2,
	PencilLine,
	ShieldCheck,
	Trash2,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/auth/hooks/useAuth";
import { KPICard } from "@/dashboard/ui/KPICard";
import {
	getMaintenanceKitEquipmentCount,
	getMaintenanceKitItemCount,
	getMaintenanceKitToolCount,
	MAINTENANCE_KIT_ACTIVITY_LABELS,
	MAINTENANCE_KIT_DELETE_ROLES,
	MAINTENANCE_KIT_EDIT_ROLES,
} from "@/maintenance/constants";
import { useDeleteMaintenanceKit, useMaintenanceKit } from "@/maintenance/queries";

export default function MaintenanceKitDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canEdit = hasRole(role, MAINTENANCE_KIT_EDIT_ROLES);
	const canDelete = hasRole(role, MAINTENANCE_KIT_DELETE_ROLES);

	const { data: kit, isLoading, error } = useMaintenanceKit(id);
	const deleteMutation = useDeleteMaintenanceKit();

	const handleDeactivate = async () => {
		if (!kit?._id) {
			return;
		}

		const confirmed = window.confirm(`¿Deseas desactivar el kit "${kit.name}"?`);
		if (!confirmed) {
			return;
		}

		await deleteMutation.mutateAsync(kit._id);
		router.push("/maintenance");
		router.refresh();
	};

	if (isLoading) {
		return (
			<section className="flex h-64 items-center justify-center rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
				<div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
					<Loader2 className="h-5 w-5 animate-spin" />
					Cargando detalle del kit...
				</div>
			</section>
		);
	}

	if (error || !kit) {
		return (
			<section className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
				No se pudo cargar el kit. {(error as Error)?.message}
			</section>
		);
	}

	const totalItems = getMaintenanceKitItemCount(kit);
	const toolCount = getMaintenanceKitToolCount(kit);
	const equipmentCount = getMaintenanceKitEquipmentCount(kit);
	const updatedAt = format(new Date(kit.updatedAt), "dd MMM yyyy, HH:mm", { locale: es });
	const createdAt = format(new Date(kit.createdAt), "dd MMM yyyy, HH:mm", { locale: es });

	return (
		<section className="space-y-6" aria-labelledby="maintenance-kit-detail-title">
			<header className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800">
				<div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
					<div className="space-y-5">
						<Link
							href="/maintenance"
							className="inline-flex items-center gap-1 text-sm font-medium text-white/75 transition hover:text-white"
						>
							<ArrowLeft aria-hidden="true" className="h-4 w-4" />
							Volver al catálogo
						</Link>

						<div className="space-y-3">
							<span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur">
								<Layers3 className="h-3.5 w-3.5" />
								Detalle del kit
							</span>

							<div className="flex flex-wrap items-center gap-3">
								<h1
									id="maintenance-kit-detail-title"
									className="text-4xl font-black tracking-tight sm:text-5xl"
								>
									{kit.name}
								</h1>
								<span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
									{MAINTENANCE_KIT_ACTIVITY_LABELS[kit.activityType]}
								</span>
								<span
									className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
										kit.isActive
											? "bg-emerald-400/15 text-emerald-200"
											: "bg-slate-500/20 text-slate-200"
									}`}
								>
									{kit.isActive ? "Activo" : "Inactivo"}
								</span>
							</div>

							<p className="max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
								Kit reutilizable para planeación y ejecución con contrato real, alineado al backend
								y sin datos simulados.
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							{canEdit ? (
								<Link
									href={`/maintenance/${kit._id}/edit`}
									className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
								>
									<PencilLine className="h-4 w-4" />
									Editar kit
								</Link>
							) : null}

							{canDelete && kit.isActive ? (
								<button
									type="button"
									onClick={handleDeactivate}
									disabled={deleteMutation.isPending}
									className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{deleteMutation.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4" />
									)}
									Desactivar kit
								</button>
							) : null}
						</div>
					</div>

					<aside className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
						<div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
									Metadatos
								</p>
								<p className="mt-1 text-lg font-semibold">
									{kit.isActive ? "Disponible" : "Desactivado"}
								</p>
							</div>
							<ShieldCheck className="h-6 w-6 text-emerald-300" />
						</div>

						<dl className="mt-4 space-y-3 text-sm">
							<div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
								<dt className="text-white/60">Creado</dt>
								<dd className="font-semibold">{createdAt}</dd>
							</div>
							<div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
								<dt className="text-white/60">Actualizado</dt>
								<dd className="font-semibold">{updatedAt}</dd>
							</div>
							<div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
								<dt className="text-white/60">Herramientas</dt>
								<dd className="font-semibold">{toolCount}</dd>
							</div>
							<div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
								<dt className="text-white/60">Equipos</dt>
								<dd className="font-semibold">{equipmentCount}</dd>
							</div>
						</dl>
					</aside>
				</div>
			</header>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<KPICard title="Herramientas" value={toolCount} icon={Wrench} />
				<KPICard title="Equipos" value={equipmentCount} icon={Package2} />
				<KPICard title="Elementos totales" value={totalItems} icon={Layers3} />
				<KPICard title="Estado" value={kit.isActive ? "Activo" : "Inactivo"} icon={CheckCircle2} />
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<div className="flex items-center justify-between gap-3">
						<div>
							<h2 className="text-xl font-bold text-slate-900 dark:text-white">
								Herramientas del kit
							</h2>
							<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
								Lista de herramientas requeridas para la actividad.
							</p>
						</div>
						<Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>

					<div className="mt-5 space-y-3">
						{kit.tools.map((tool) => (
							<article
								key={`${tool.name}-${tool.quantity}`}
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-semibold text-slate-900 dark:text-white">{tool.name}</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{tool.specifications
												? tool.specifications
												: "Sin especificaciones adicionales"}
										</p>
									</div>
									<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
										Cantidad: {tool.quantity}
									</span>
								</div>
							</article>
						))}

						{kit.tools.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
								Este kit todavía no define herramientas.
							</p>
						) : null}
					</div>
				</section>

				<section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<div className="flex items-center justify-between gap-3">
						<div>
							<h2 className="text-xl font-bold text-slate-900 dark:text-white">Equipos del kit</h2>
							<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
								Equipos asociados y su exigencia documental.
							</p>
						</div>
						<Package2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					</div>

					<div className="mt-5 space-y-3">
						{kit.equipment.map((item) => (
							<article
								key={`${item.name}-${item.quantity}`}
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
							>
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											{item.certificateRequired
												? "Requiere certificación"
												: "Sin certificación obligatoria"}
										</p>
									</div>
									<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
										Cantidad: {item.quantity}
									</span>
								</div>
							</article>
						))}

						{kit.equipment.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
								Este kit no requiere equipos adicionales.
							</p>
						) : null}
					</div>
				</section>
			</div>

			<section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<h2 className="text-xl font-bold text-slate-900 dark:text-white">Información adicional</h2>
				<div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
							Actividad
						</p>
						<p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
							{MAINTENANCE_KIT_ACTIVITY_LABELS[kit.activityType]}
						</p>
					</article>
					<article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
							Estado
						</p>
						<p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
							{kit.isActive
								? "Kit activo y listo para asignar"
								: "Kit desactivado para nuevas asignaciones"}
						</p>
					</article>
					<article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:col-span-2 xl:col-span-1">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
							Capacidad
						</p>
						<p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
							{toolCount} herramientas y {equipmentCount} equipos integran la plantilla actual.
						</p>
					</article>
				</div>
			</section>
		</section>
	);
}
