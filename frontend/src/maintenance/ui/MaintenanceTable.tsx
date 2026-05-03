"use client";

import type { MaintenanceKit } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Loader2, Package2, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import {
	formatMaintenanceKitActivityLabel,
	MAINTENANCE_KIT_ACTIVITY_OPTIONS,
	MAINTENANCE_KIT_VISIBILITY_OPTIONS,
} from "../constants";
import { getKitSummary } from "../lib/kit-formatters";

interface MaintenanceTableProps {
	kits: MaintenanceKit[];
	isFetching: boolean;
	search: string;
	activityFilter: string;
	visibilityFilter: string;
	onSearchChange: (value: string) => void;
	onActivityChange: (value: string) => void;
	onVisibilityChange: (value: string) => void;
	onReset: () => void;
	canEdit: boolean;
	canDelete: boolean;
	canCreate: boolean;
	onDelete: (id: string, name: string) => void;
	isDeleting: boolean;
	page: number;
	totalPages?: number;
	onPageChange: (page: number) => void;
}

export function MaintenanceTable({
	kits,
	isFetching,
	search,
	activityFilter,
	visibilityFilter,
	onSearchChange,
	onActivityChange,
	onVisibilityChange,
	onReset,
	canEdit,
	canDelete,
	canCreate,
	onDelete,
	isDeleting,
	page,
	totalPages,
	onPageChange,
}: MaintenanceTableProps) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-bold text-[var(--text-primary)]">Catálogo de kits</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Revisa, filtra y administra los kits típicos disponibles.
					</p>
				</div>

				<button
					type="button"
					onClick={onReset}
					className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
				>
					Restablecer filtros
				</button>
			</div>

			<div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
				<FormField label="Buscar" htmlFor="maintenance-kit-search">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<TextField
							id="maintenance-kit-search"
							value={search}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder="Buscar por nombre"
							className="pl-9"
						/>
					</div>
				</FormField>

				<FormField label="Actividad" htmlFor="maintenance-kit-activity-filter">
					<Select
						id="maintenance-kit-activity-filter"
						value={activityFilter}
						onChange={(event) => onActivityChange(event.target.value)}
					>
						<option value="all">Todas</option>
						{MAINTENANCE_KIT_ACTIVITY_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</FormField>

				<FormField label="Estado" htmlFor="maintenance-kit-visibility-filter">
					<Select
						id="maintenance-kit-visibility-filter"
						value={visibilityFilter}
						onChange={(event) => onVisibilityChange(event.target.value)}
					>
						{MAINTENANCE_KIT_VISIBILITY_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</FormField>
			</div>

			<div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
				{isFetching && kits.length > 0 ? (
					<div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
						<Loader2 className="h-4 w-4 animate-spin" />
						Actualizando catálogo...
					</div>
				) : null}

				{kits.length === 0 ? (
					<div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
						<div className="rounded-full bg-[var(--surface-secondary)] p-4 text-[var(--text-tertiary)]">
							<Package2 className="h-6 w-6" />
						</div>
						<div className="max-w-md space-y-2">
							<h3 className="text-lg font-semibold text-[var(--text-primary)]">
								No hay kits en la vista actual
							</h3>
							<p className="text-sm text-[var(--text-secondary)]">
								Prueba otro filtro o crea un nuevo kit para arrancar el catálogo.
							</p>
						</div>
						{canCreate ? (
							<Link
								href="/maintenance/new"
								className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-blue-hover)]"
							>
								<Plus className="h-4 w-4" />
								Crear kit
							</Link>
						) : null}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[900px] text-sm">
							<caption className="sr-only">
								Listado de kits típicos con acceso al detalle, edición y desactivación.
							</caption>
							<thead className="bg-[var(--surface-secondary)] text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
								<tr>
									<th scope="col" className="px-4 py-3 font-semibold">
										Kit
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Código
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Actividad
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Riesgo
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Costo base
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Estado
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Actualizado
									</th>
									<th scope="col" className="px-4 py-3 font-semibold">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border-default)]">
								{kits.map((kit) => {
									const updatedAt = kit.updatedAt
										? format(new Date(kit.updatedAt), "dd MMM yyyy", { locale: es })
										: "—";

									return (
										<tr
											key={kit._id}
											className="transition-colors hover:bg-[var(--surface-secondary)]"
										>
											<td className="px-4 py-4">
												<div className="space-y-1">
													<p className="font-semibold text-[var(--text-primary)]">{kit.name}</p>
													<p className="text-xs text-[var(--text-secondary)]">
														{getKitSummary(kit.tools.length, kit.equipment.length)}
													</p>
												</div>
											</td>
											<td className="px-4 py-4 text-[var(--text-secondary)]">
												{kit.code ?? "Pendiente"}
											</td>
											<td className="px-4 py-4 text-[var(--text-secondary)]">
												{formatMaintenanceKitActivityLabel(kit.activityType)}
											</td>
											<td className="px-4 py-4 text-[var(--text-secondary)]">
												{kit.safety?.riskClassification ?? "Sin clasificar"}
											</td>
											<td className="px-4 py-4 text-[var(--text-secondary)]">
												{(kit.baseMaterialCost ?? 0).toLocaleString("es-CO", {
													style: "currency",
													currency: "COP",
													maximumFractionDigits: 0,
												})}
											</td>
											<td className="px-4 py-4">
												<span
													className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
														kit.isActive
															? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
															: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
													}`}
												>
													{kit.isActive ? "Activo" : "Inactivo"}
												</span>
											</td>
											<td className="px-4 py-4 text-[var(--text-secondary)]">{updatedAt}</td>
											<td className="px-4 py-4">
												<div className="flex flex-wrap items-center gap-2">
													<Link
														href={`/maintenance/${kit._id}`}
														className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
													>
														Ver
														<ArrowRight className="h-3.5 w-3.5" />
													</Link>

													{canEdit ? (
														<Link
															href={`/maintenance/${kit._id}/edit`}
															className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
														>
															<PencilLine className="h-3.5 w-3.5" />
															Editar
														</Link>
													) : null}

													{canDelete && kit.isActive ? (
														<button
															type="button"
															onClick={() => onDelete(kit._id, kit.name)}
															disabled={isDeleting}
															className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-danger-bg)] px-3 text-xs font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]/60 disabled:cursor-not-allowed disabled:opacity-60"
														>
															{isDeleting ? (
																<Loader2 className="h-3.5 w-3.5 animate-spin" />
															) : (
																<Trash2 className="h-3.5 w-3.5" />
															)}
															Desactivar
														</button>
													) : null}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{totalPages && totalPages > 1 ? (
					<div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
						<p>
							Página {page} de {totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => onPageChange(Math.max(1, page - 1))}
								disabled={page <= 1}
								className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
							>
								Anterior
							</button>
							<button
								type="button"
								onClick={() => onPageChange(Math.min(totalPages, page + 1))}
								disabled={page >= totalPages}
								className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
							>
								Siguiente
							</button>
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}
