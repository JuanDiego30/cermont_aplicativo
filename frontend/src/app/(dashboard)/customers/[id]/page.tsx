"use client";

/**
 * /customers/[id] — Detalle de cliente con historial de interacciones.
 */

import { ArrowLeft, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import { formatDateTime } from "@/lib/utils/format-date";
import { useCustomerHistory, useUpdateCustomer } from "@/modules/customers/queries";
import { CustomerForm } from "@/modules/customers/ui/CustomerForm";

export default function CustomerDetailPage() {
	const params = useParams<{ id: string }>();
	const customerId = params?.id ?? "";
	const { data, isLoading, error, refetch } = useCustomerHistory(customerId);
	const updateMutation = useUpdateCustomer();
	const [isEditing, setIsEditing] = useState(false);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton variant="text" className="h-8 w-64" />
				<Skeleton variant="chart" height={140} />
				<Skeleton variant="chart" height={200} />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="space-y-4">
				<Link
					href="/customers"
					className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
				>
					<ArrowLeft className="size-4" aria-hidden="true" /> Volver a clientes
				</Link>
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">No se pudo cargar el cliente.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			</div>
		);
	}

	const { client, workRequests, proposals, serviceCases, invoices } = data;

	const historySections = [
		{ title: "Solicitudes de trabajo", items: workRequests },
		{ title: "Propuestas", items: proposals },
		{ title: "Casos de servicio", items: serviceCases },
		{ title: "Facturas", items: invoices },
	];

	return (
		<section className="space-y-6" aria-labelledby="customer-detail-title">
			<Link
				href="/customers"
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver a clientes
			</Link>

			<header className="flex items-start justify-between gap-3">
				<div>
					<h1
						id="customer-detail-title"
						className="text-xl font-semibold text-[var(--text-primary)]"
					>
						{client.name}
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">NIT {client.nit}</p>
				</div>
				<button
					type="button"
					onClick={() => setIsEditing((v) => !v)}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					<Pencil className="size-4" aria-hidden="true" />
					{isEditing ? "Cerrar edición" : "Editar"}
				</button>
			</header>

			{isEditing ? (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
					<CustomerForm
						initial={client}
						isSaving={updateMutation.isPending}
						onSubmit={async (input) => {
							if (client._id) {
								await updateMutation.mutateAsync({ id: client._id, input });
								setIsEditing(false);
							}
						}}
						onCancel={() => setIsEditing(false)}
					/>
				</div>
			) : (
				<dl className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] sm:grid-cols-3">
					{[
						{ label: "Contacto", value: client.contactName },
						{ label: "Email", value: client.email },
						{ label: "Teléfono", value: client.phone },
						{ label: "Dirección", value: client.address },
						{ label: "Ciudad", value: client.city },
						{ label: "Industria", value: client.industry },
					].map((item) => (
						<div key={item.label}>
							<dt className="text-xs font-medium text-[var(--text-tertiary)]">{item.label}</dt>
							<dd className="mt-0.5 text-sm text-[var(--text-primary)]">{item.value || "—"}</dd>
						</div>
					))}
				</dl>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				{historySections.map((section) => (
					<article
						key={section.title}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
					>
						<h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
							<FileText className="size-4" aria-hidden="true" />
							{section.title} ({section.items.length})
						</h2>
						{section.items.length === 0 ? (
							<p className="text-xs text-[var(--text-tertiary)]">Sin registros</p>
						) : (
							<ul className="space-y-1.5">
								{section.items.slice(0, 8).map((item) => (
									<li key={item._id} className="flex items-center justify-between text-xs">
										<span className="font-medium text-[var(--text-primary)]">{item.code}</span>
										<span className="text-[var(--text-tertiary)]">
											{item.status ?? item.currentStage ?? ""} · {formatDateTime(item.createdAt)}
										</span>
									</li>
								))}
							</ul>
						)}
					</article>
				))}
			</div>

			{client.notes && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
					<h2 className="mb-1 text-sm font-medium text-[var(--text-secondary)]">Notas</h2>
					<p className="text-sm text-[var(--text-primary)]">{client.notes}</p>
				</div>
			)}
		</section>
	);
}
