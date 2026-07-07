"use client";

import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useCreateDeliveryRecordFromTechnicalReport } from "@/modules/billing/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

export default function NewDeliveryRecordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<NewDeliveryRecordForm />
		</Suspense>
	);
}

function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

function NewDeliveryRecordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const prefilledReportId = searchParams.get("technicalReportId") ?? "";

	const {
		workflow,
		isLoading: isContextLoading,
		inheritedFields,
	} = useServiceCaseContext("step_09_delivery_record", serviceCaseId);

	// Derive report ID: prefer URL param → artifacts
	const derivedReportId = prefilledReportId || workflow?.artifacts?.technicalReport?.id || "";

	const technicalReportId = derivedReportId;
	const [deliveryDate, setDeliveryDate] = useState(todayIso());
	const [clientRepresentative, setClientRepresentative] = useState("");
	const [clientContact, setClientContact] = useState("");
	const [clientObservations, setClientObservations] = useState("");

	const createMutation = useCreateDeliveryRecordFromTechnicalReport(
		technicalReportId || derivedReportId,
	);

	const resolvedReportId = technicalReportId || derivedReportId;

	if (!resolvedReportId && !isContextLoading) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-[var(--color-danger)]">Falta informe técnico</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Accede a esta página desde el cockpit del caso.
				</p>
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/delivery-records"}
					className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] hover:underline"
				>
					{serviceCaseId ? "Volver al caso" : "Ir a actas de entrega"}
				</Link>
			</div>
		);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		createMutation.mutate(
			{
				deliveryDate: deliveryDate || undefined,
				clientRepresentative: clientRepresentative.trim() || undefined,
				clientContact: clientContact.trim() || undefined,
				clientObservations: clientObservations.trim() || undefined,
			},
			{
				onSuccess: (response) => {
					toast.success("Acta de entrega creada");
					const recordId = (response as { data?: { _id?: string } }).data?._id;
					if (recordId) {
						router.push(`/delivery-records/${recordId}`);
					} else if (serviceCaseId) {
						router.push(`/service-cases/${serviceCaseId}`);
					} else {
						router.push("/delivery-records");
					}
				},
				onError: (err) => {
					toast.error("Error al crear el acta", { description: err.message });
				},
			},
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-delivery-title">
			<header className="space-y-3">
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/delivery-records"}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 8 / Acta de entrega</p>
					<h1
						id="new-delivery-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Nueva acta de entrega
					</h1>
					{workflow && (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{workflow.code} — {workflow.clientName}
						</p>
					)}
					{resolvedReportId && (
						<p className="mt-1 text-xs text-[var(--text-muted)]">
							Informe: <code className="font-mono">{resolvedReportId}</code>
						</p>
					)}
				</div>
			</header>

			{/* Inherited context banner */}
			{!isContextLoading && inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<div className="mb-2 flex items-center gap-2">
						<Info className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
						<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
							Datos heredados del caso
						</p>
					</div>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{inheritedFields.slice(0, 6).map((field) => (
							<div
								key={field.key}
								className="rounded-[var(--radius-md)] bg-background/70 px-3 py-2"
							>
								<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
									{field.label}
								</p>
								<p className="mt-0.5 truncate text-sm font-semibold text-[var(--text-primary)]">
									{field.value}
								</p>
								<p className="text-[9px] text-[var(--color-brand)]">↑ {field.sourceStepLabel}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				noValidate
			>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-1.5 md:col-span-2">
						<label
							htmlFor="deliveryDate"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Fecha de entrega
						</label>
						<input
							id="deliveryDate"
							type="date"
							value={deliveryDate}
							onChange={(e) => setDeliveryDate(e.target.value)}
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm md:max-w-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="clientRepresentative"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Representante del cliente{" "}
							<span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<input
							id="clientRepresentative"
							type="text"
							value={clientRepresentative}
							onChange={(e) => setClientRepresentative(e.target.value)}
							placeholder="Nombre del representante"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="clientContact"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Contacto del cliente{" "}
							<span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<input
							id="clientContact"
							type="text"
							value={clientContact}
							onChange={(e) => setClientContact(e.target.value)}
							placeholder="Teléfono o correo"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					</div>

					<div className="space-y-1.5 md:col-span-2">
						<label
							htmlFor="clientObservations"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Observaciones del cliente{" "}
							<span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<textarea
							id="clientObservations"
							rows={4}
							value={clientObservations}
							onChange={(e) => setClientObservations(e.target.value)}
							placeholder="Observaciones o comentarios del cliente al recibir el servicio..."
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" variant="primary" loading={createMutation.isPending}>
						<Save className="size-4" aria-hidden="true" />
						Crear acta
					</Button>
					<Button asChild type="button" variant="secondary">
						<Link href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/delivery-records"}>
							Cancelar
						</Link>
					</Button>
				</div>
			</form>
		</section>
	);
}
