"use client";

import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useCreateServiceEntrySheetFromDeliveryRecord } from "@/modules/billing/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

export default function NewSESPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<NewSESForm />
		</Suspense>
	);
}

function NewSESForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const prefilledDeliveryId = searchParams.get("deliveryRecordId") ?? "";

	const {
		workflow,
		isLoading: isContextLoading,
		inheritedFields,
	} = useServiceCaseContext("step_10_ses_submission", serviceCaseId);

	// Derive delivery record ID: prefer URL param → artifacts
	const derivedDeliveryId = prefilledDeliveryId || workflow?.artifacts?.deliveryRecord?.id || "";

	const deliveryRecordId = derivedDeliveryId;
	const [aribaDocumentNumber, setAribaDocumentNumber] = useState("");
	const [description, setDescription] = useState("");
	const [total, setTotal] = useState("");
	const [subtotal, setSubtotal] = useState("");

	const resolvedDeliveryId = deliveryRecordId || derivedDeliveryId;

	const createMutation = useCreateServiceEntrySheetFromDeliveryRecord(resolvedDeliveryId);

	if (!resolvedDeliveryId && !isContextLoading) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-[var(--color-danger)]">Falta acta de entrega</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Accede a esta página desde el cockpit del caso.
				</p>
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/billing/ses"}
					className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] hover:underline"
				>
					{serviceCaseId ? "Volver al caso" : "Ir a SES"}
				</Link>
			</div>
		);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const totalNum = parseFloat(total);
		const subtotalNum = parseFloat(subtotal) || totalNum;

		if (!total || Number.isNaN(totalNum) || totalNum <= 0) {
			toast.error("El total debe ser un valor positivo");
			return;
		}

		createMutation.mutate(
			{
				aribaDocumentNumber: aribaDocumentNumber.trim() || undefined,
				description: description.trim() || undefined,
				serviceLines: [
					{
						description: description.trim() || "Servicio ejecutado",
						quantity: 1,
						unitPrice: totalNum,
						total: totalNum,
						unit: "UN",
					},
				],
				subtotal: subtotalNum,
				taxLines: [
					{
						name: "IVA",
						rate: 0.19,
						amount: Math.round(totalNum - totalNum / 1.19),
					},
				],
				total: totalNum,
				currency: "COP",
			},
			{
				onSuccess: (response) => {
					toast.success("SES creado");
					const sesId = (response as { data?: { _id?: string } }).data?._id;
					if (sesId) {
						router.push(`/billing/ses/${sesId}`);
					} else if (serviceCaseId) {
						router.push(`/service-cases/${serviceCaseId}`);
					} else {
						router.push("/billing/ses");
					}
				},
				onError: (err) => {
					toast.error("Error al crear el SES", { description: err.message });
				},
			},
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-ses-title">
			<header className="space-y-3">
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/billing/ses"}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 10 / SES Ariba</p>
					<h1 id="new-ses-title" className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
						Nuevo Service Entry Sheet
					</h1>
					{workflow && (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{workflow.code} — {workflow.clientName}
						</p>
					)}
					{resolvedDeliveryId && (
						<p className="mt-1 text-xs text-[var(--text-muted)]">
							Acta: <code className="font-mono">{resolvedDeliveryId}</code>
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
				<div className="space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="aribaDocumentNumber"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Número documento Ariba{" "}
							<span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<input
							id="aribaDocumentNumber"
							type="text"
							value={aribaDocumentNumber}
							onChange={(e) => setAribaDocumentNumber(e.target.value)}
							placeholder="Ej. ARIBA-2024-001"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="sesDescription"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Descripción del servicio{" "}
							<span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<textarea
							id="sesDescription"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Descripción del servicio ejecutado..."
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<label htmlFor="subtotal" className="text-sm font-medium text-[var(--text-primary)]">
								Subtotal (COP)
							</label>
							<input
								id="subtotal"
								type="number"
								min="0"
								step="1"
								value={subtotal}
								onChange={(e) => setSubtotal(e.target.value)}
								placeholder="0"
								className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="total" className="text-sm font-medium text-[var(--text-primary)]">
								Total (COP) <span className="text-brand-error">*</span>
							</label>
							<input
								id="total"
								type="number"
								required
								min="0.01"
								step="1"
								value={total}
								onChange={(e) => setTotal(e.target.value)}
								placeholder="0"
								className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" variant="primary" loading={createMutation.isPending}>
						<Save className="size-4" aria-hidden="true" />
						Crear SES
					</Button>
					<Button asChild type="button" variant="secondary">
						<Link href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/billing/ses"}>
							Cancelar
						</Link>
					</Button>
				</div>
			</form>
		</section>
	);
}
