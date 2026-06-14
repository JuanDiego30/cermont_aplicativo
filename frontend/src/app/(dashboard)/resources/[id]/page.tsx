"use client";

/**
 * Resource Detail Page — Full read / edit view
 *
 * Displays all fields from the expanded Resource schema:
 * name, type, status, description, identifiers, inventory, images, etc.
 *
 * Edit is handled inline via ResourceForm dialog. Images are managed
 * via ResourceImageEditor.
 */

import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/core/ui/Button";
import { formatDate } from "@/lib/utils/format-date";
import { useResourceDetail } from "@/modules/resources/hooks/useResources";
import { ResourceForm } from "@/modules/resources/ui/ResourceForm";
import { ResourceImageEditor } from "@/modules/resources/ui/ResourceImageEditor";
import {
	RESOURCE_TYPE_LABELS,
	STATUS_LABELS,
	STATUS_STYLES,
	UNIT_LABELS,
} from "../resource-constants";

export default function ResourceDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const { data: resource, isLoading, isError, error, refetch } = useResourceDetail(id);
	const [editOpen, setEditOpen] = useState(false);

	const handleEditSuccess = useCallback(() => {
		setEditOpen(false);
		refetch();
	}, [refetch]);

	// Computed labels
	const typeLabel = useMemo(
		() => (resource ? (RESOURCE_TYPE_LABELS[resource.type] ?? resource.type) : ""),
		[resource],
	);
	const statusKey = resource?.status ?? "available";
	const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;
	const unitLabel = resource?.unit ? (UNIT_LABELS[resource.unit] ?? resource.unit) : "";
	const statusStyle = STATUS_STYLES[statusKey] ?? "bg-zinc-100 text-zinc-600 ring-zinc-300";

	// Loading state
	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center text-[var(--text-secondary)]">
				<Loader2 className="mr-2 size-6 animate-spin" aria-hidden="true" />
				Cargando detalle…
			</div>
		);
	}

	// Error state
	if (isError || !resource) {
		return (
			<div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-8 text-center">
				<p className="text-sm font-medium text-[var(--color-danger)]">
					{(error as Error)?.message ?? "Recurso no encontrado"}
				</p>
				<div className="flex gap-3">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Reintentar
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/resources">Volver al listado</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="resource-detail-title">
			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-start gap-3">
					<Link
						href="/resources"
						className="mt-1 flex items-center gap-1 text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						Volver
					</Link>
					<div>
						<h1
							id="resource-detail-title"
							className="text-2xl font-semibold text-[var(--text-primary)]"
						>
							{resource.name}
						</h1>
						<div className="mt-1 flex flex-wrap items-center gap-2">
							<span className="rounded-full bg-[var(--surface-secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-default)]">
								{typeLabel}
							</span>
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyle}`}
							>
								{statusLabel}
							</span>
							{resource.active === false ? (
								<span className="rounded-full bg-[var(--color-danger-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-danger)] ring-1 ring-inset ring-[var(--color-danger)]/20">
									Inactivo
								</span>
							) : null}
						</div>
					</div>
				</div>

				<Button onClick={() => setEditOpen(true)} variant="outline" size="sm">
					<Pencil aria-hidden="true" className="size-4" />
					Editar
				</Button>
			</div>

			{/* Info grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main info card */}
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] lg:col-span-2">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
						Información general
					</h2>

					<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
						{field("Nombre", resource.name)}
						{field("Tipo", typeLabel)}
						{field("Estado", statusLabel)}
						{field("Unidad", unitLabel || "—")}
						{field("Cantidad por defecto", String(resource.defaultQuantity ?? 1))}
						{field("Activo", resource.active !== false ? "Sí" : "No")}
						{resource.description ? field("Descripción", resource.description) : null}
						{resource.serialNumber ? field("N° Serial", resource.serialNumber) : null}
						{resource.brand ? field("Marca", resource.brand) : null}
						{resource.model ? field("Modelo", resource.model) : null}
						{resource.category ? field("Categoría", resource.category) : null}
						{resource.purchaseDate
							? field("Fecha de compra", formatDate(resource.purchaseDate))
							: null}
					</dl>
				</div>

				{/* Side info card */}
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
						Auditoría
					</h2>
					<dl className="space-y-3 text-sm">
						{resource.createdBy ? field("Creado por", resource.createdBy) : null}
						{resource.updatedBy ? field("Actualizado por", resource.updatedBy) : null}
						{field("Creado", formatDate(resource.createdAt))}
						{field("Actualizado", formatDate(resource.updatedAt))}
					</dl>
				</div>
			</div>

			{/* Image gallery */}
			<ResourceImageEditor
				resourceId={resource._id}
				resourceType={resource.type}
				images={resource.images ?? []}
			/>

			{/* Certifications */}
			{resource.certifications && resource.certifications.length > 0 ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
						Certificaciones ({resource.certifications.length})
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[500px] text-sm">
							<thead>
								<tr className="border-b border-[var(--border-default)] text-left text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
									<th scope="col" className="px-3 py-2">
										Nombre
									</th>
									<th scope="col" className="px-3 py-2">
										Tipo
									</th>
									<th scope="col" className="px-3 py-2">
										Emisión
									</th>
									<th scope="col" className="px-3 py-2">
										Vencimiento
									</th>
									<th scope="col" className="px-3 py-2">
										Estado
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border-subtle)]">
								{resource.certifications.map((cert) => (
									<tr key={cert.id} className="hover:bg-[var(--surface-secondary)]">
										<td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
											{cert.name}
										</td>
										<td className="px-3 py-2.5 text-[var(--text-secondary)]">{cert.type}</td>
										<td className="px-3 py-2.5 text-[var(--text-secondary)]">
											{formatDate(cert.issuedAt)}
										</td>
										<td className="px-3 py-2.5 text-[var(--text-secondary)]">
											{formatDate(cert.expiresAt)}
										</td>
										<td className="px-3 py-2.5">
											<span
												className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
													cert.status === "valid"
														? "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/20"
														: cert.status === "expired"
															? "bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/20"
															: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-default)]"
												}`}
											>
												{cert.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : null}

			{/* Dialog for editing */}
			<ResourceForm
				resource={resource}
				open={editOpen}
				onOpenChange={setEditOpen}
				onSuccess={handleEditSuccess}
			/>
		</section>
	);
}

/** Small helper to render a dt/dd pair */
function field(label: string, value: string): React.ReactNode {
	return (
		<div>
			<dt className="text-xs font-medium text-[var(--text-tertiary)]">{label}</dt>
			<dd className="mt-0.5 text-sm text-[var(--text-primary)]">{value}</dd>
		</div>
	);
}
