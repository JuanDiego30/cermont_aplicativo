"use client";

/**
 * Admin — Campos personalizados por tipo de entidad.
 */

import type { CreateCustomFieldDefinitionDto, CustomFieldDefinition } from "@cermont/shared-types";
import { ListPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import {
	useCreateCustomFieldDefinition,
	useCustomFieldDefinitions,
	useDeleteCustomFieldDefinition,
	useUpdateCustomFieldDefinition,
} from "@/modules/custom-fields/queries";
import { CustomFieldEditor } from "@/modules/custom-fields/ui/CustomFieldEditor";

const ENTITY_TYPES = [
	{ value: "work_request", label: "Solicitudes" },
	{ value: "order", label: "Órdenes" },
	{ value: "asset", label: "Activos" },
	{ value: "user", label: "Usuarios" },
	{ value: "client", label: "Clientes" },
] as const;

type EntityType = (typeof ENTITY_TYPES)[number]["value"];

const DATA_TYPE_LABELS: Record<string, string> = {
	text: "Texto",
	number: "Número",
	boolean: "Sí / No",
	select: "Lista",
	date: "Fecha",
};

export default function AdminCustomFieldsPage() {
	const [entityType, setEntityType] = useState<EntityType>("work_request");
	const [editing, setEditing] = useState<CustomFieldDefinition | "new" | "">("");
	const { data, isLoading, error, refetch } = useCustomFieldDefinitions(entityType, true);
	const createMutation = useCreateCustomFieldDefinition();
	const updateMutation = useUpdateCustomFieldDefinition();
	const deleteMutation = useDeleteCustomFieldDefinition();

	const definitions = data ?? [];
	const isSaving = createMutation.isPending || updateMutation.isPending;

	async function handleSave(input: CreateCustomFieldDefinitionDto) {
		if (editing && editing !== "new" && editing._id) {
			await updateMutation.mutateAsync({ id: editing._id, input });
		} else {
			await createMutation.mutateAsync(input);
		}
		setEditing("");
	}

	return (
		<section className="space-y-6" aria-labelledby="custom-fields-title">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="custom-fields-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Campos personalizados
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						Define campos adicionales por tipo de entidad para los formularios del sistema.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setEditing("new")}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<ListPlus className="size-4" aria-hidden="true" />
					Nuevo campo
				</button>
			</header>

			<nav aria-label="Tipo de entidad" className="flex flex-wrap gap-2">
				{ENTITY_TYPES.map((et) => (
					<button
						type="button"
						key={et.value}
						onClick={() => {
							setEntityType(et.value);
							setEditing("");
						}}
						className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
							entityType === et.value
								? "bg-[var(--color-brand-blue)] text-white"
								: "border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						{et.label}
					</button>
				))}
			</nav>

			{editing && (
				<CustomFieldEditor
					entityType={entityType}
					{...(editing !== "new" ? { initial: editing } : {})}
					key={editing === "new" ? "new" : editing._id}
					isSaving={isSaving}
					onSave={handleSave}
					onCancel={() => setEditing("")}
				/>
			)}

			{isLoading && (
				<div className="space-y-2">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} variant="chart" height={56} />
					))}
				</div>
			)}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">Error al cargar los campos personalizados.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !error && definitions.length === 0 && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-12 text-center">
					<p className="text-[var(--text-secondary)]">
						No hay campos personalizados para esta entidad.
					</p>
				</div>
			)}

			{definitions.length > 0 && (
				<ul className="space-y-2">
					{definitions.map((def) => (
						<li
							key={def._id ?? def.name}
							className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
						>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<p className="truncate text-sm font-medium text-[var(--text-primary)]">
										{def.label}
									</p>
									<span className="shrink-0 rounded bg-[var(--surface-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
										{DATA_TYPE_LABELS[def.dataType] ?? def.dataType}
									</span>
									{def.validation?.required && (
										<span className="shrink-0 rounded bg-[var(--color-warning-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-warning)]">
											Obligatorio
										</span>
									)}
									{!def.isActive && (
										<span className="shrink-0 rounded bg-[var(--color-danger-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-danger)]">
											Inactivo
										</span>
									)}
								</div>
								<p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
									{def.name}
									{def.description ? ` — ${def.description}` : ""}
								</p>
							</div>
							<div className="flex shrink-0 gap-1">
								<button
									type="button"
									onClick={() => setEditing(def)}
									className="rounded-full p-2 text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--color-brand-blue)]"
									aria-label={`Editar ${def.label}`}
								>
									<Pencil className="size-4" aria-hidden="true" />
								</button>
								<button
									type="button"
									onClick={() => {
										if (def._id && window.confirm(`¿Eliminar el campo "${def.label}"?`)) {
											deleteMutation.mutate(def._id);
										}
									}}
									className="rounded-full p-2 text-[var(--text-tertiary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
									aria-label={`Eliminar ${def.label}`}
								>
									<Trash2 className="size-4" aria-hidden="true" />
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
