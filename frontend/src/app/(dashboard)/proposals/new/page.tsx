"use client";

import type { CreateProposalInput } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateProposal } from "@/modules/proposals/hooks/useCreateProposal";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

const ProposalItemFormSchema = z.object({
	description: z.string().min(1, "La descripción es requerida").max(300),
	unit: z.string().min(1, "La unidad es requerida").max(50),
	quantity: z.number().positive("Debe ser mayor a 0"),
	unitCost: z.number().nonnegative("Debe ser mayor o igual a 0"),
});

const ProposalFormSchema = z.object({
	clientName: z.string().min(2, "El nombre del cliente debe tener al menos 2 caracteres").max(200),
	clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
	validUntil: z.string().min(1, "La fecha de validez es requerida"),
	items: z.array(ProposalItemFormSchema).min(1, "Agrega al menos un item"),
	notes: z.string().max(2000).optional(),
});

type ProposalFormValues = z.infer<typeof ProposalFormSchema>;

const copFormatter = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatCOP(value: number): string {
	return copFormatter.format(value);
}

function calcItemTotal(quantity: number, unitCost: number): number {
	return quantity * unitCost;
}

export default function NewProposalPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
				</div>
			}
		>
			<NewProposalContent />
		</Suspense>
	);
}

function NewProposalContent() {
	const { push } = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";

	// Load inherited context when serviceCaseId is present
	const { inheritedFields, isLoading: isContextLoading } = useServiceCaseContext(
		"step_03_proposal",
		serviceCaseId,
	);

	const inheritedClientName = inheritedFields.find((f) => f.key === "clientName")?.value ?? "";

	const mutation = useCreateProposal();
	const isSubmitting = mutation.isPending;

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ProposalFormValues>({
		resolver: zodResolver(ProposalFormSchema),
		defaultValues: {
			clientName: "",
			clientEmail: "",
			validUntil: format(addDays(new Date(), 30), "yyyy-MM-dd"),
			items: [{ description: "", unit: "lote", quantity: 1, unitCost: 0 }],
			notes: "",
		},
	});

	// Apply inherited clientName once loaded
	const watchedClientName = watch("clientName");
	if (inheritedClientName && !watchedClientName) {
		setValue("clientName", inheritedClientName);
	}

	const { fields, append, remove } = useFieldArray({ control, name: "items" });
	const watchedItems = watch("items");
	const taxRateValue = 0.19;

	const subtotal =
		watchedItems?.reduce(
			(sum, item) => sum + calcItemTotal(item.quantity ?? 0, item.unitCost ?? 0),
			0,
		) ?? 0;
	const taxAmount = subtotal * taxRateValue;
	const total = subtotal + taxAmount;

	const onSubmit = async (data: ProposalFormValues) => {
		const payload: CreateProposalInput = {
			title: `Propuesta para ${data.clientName.trim()}`,
			clientName: data.clientName.trim(),
			clientEmail: data.clientEmail?.trim() || undefined,
			validUntil: new Date(data.validUntil).toISOString(),
			items: data.items.map((item) => ({
				description: item.description.trim(),
				unit: item.unit.trim(),
				quantity: item.quantity,
				unitCost: item.unitCost,
			})),
			notes: data.notes?.trim() || undefined,
		};

		const result = await mutation.mutateAsync(payload);
		// Navigate back to cockpit if we have a serviceCaseId, otherwise to proposal detail
		if (serviceCaseId) {
			push(`/service-cases/${serviceCaseId}`);
		} else {
			push(`/proposals/${result._id}`);
		}
	};

	return (
		<section className="mx-auto max-w-3xl space-y-6" aria-labelledby="new-proposal-title">
			<div className="flex items-center gap-3">
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/proposals"}
					className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver
				</Link>
				<div>
					<p className="text-xs font-medium text-[var(--color-brand)]">
						Paso 3 / Propuesta económica
					</p>
					<h1 id="new-proposal-title" className="text-2xl font-semibold text-foreground">
						Nueva Propuesta
					</h1>
				</div>
			</div>

			{/* Inherited context banner */}
			{!isContextLoading && inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
						Datos heredados del caso
					</p>
					<div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{inheritedFields.slice(0, 6).map((field) => (
							<div key={field.key} className="rounded-[var(--radius-md)] bg-white/70 px-3 py-2">
								<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
									{field.label}
								</p>
								<p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)] truncate">
									{field.value}
								</p>
								<p className="text-[9px] text-[var(--color-brand)]">↑ {field.sourceStepLabel}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
				{/* Client info */}
				<section
					className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
					aria-labelledby="client-section-title"
				>
					<h2
						id="client-section-title"
						className="text-base font-semibold text-[var(--text-primary)]"
					>
						Información del Cliente
					</h2>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<div>
							<label
								htmlFor="clientName"
								className="block text-sm font-medium text-[var(--text-secondary)]"
							>
								Cliente <span className="text-[var(--color-danger)]">*</span>
							</label>
							<input
								id="clientName"
								type="text"
								{...register("clientName")}
								placeholder="Nombre del cliente"
								className="input-field mt-1"
							/>
							{errors.clientName && (
								<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
									{errors.clientName.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="clientEmail"
								className="block text-sm font-medium text-[var(--text-secondary)]"
							>
								Email
							</label>
							<input
								id="clientEmail"
								type="email"
								{...register("clientEmail")}
								placeholder="cliente@ejemplo.com"
								className="input-field mt-1"
							/>
							{errors.clientEmail && (
								<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
									{errors.clientEmail.message}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="validUntil"
								className="block text-sm font-medium text-[var(--text-secondary)]"
							>
								Válida hasta <span className="text-[var(--color-danger)]">*</span>
							</label>
							<input
								id="validUntil"
								type="date"
								{...register("validUntil")}
								className="input-field mt-1"
							/>
							{errors.validUntil && (
								<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
									{errors.validUntil.message}
								</p>
							)}
						</div>
					</div>
				</section>

				{/* Line items */}
				<section
					className="rounded-xl border border-border bg-card p-6 shadow-sm"
					aria-labelledby="items-section-title"
				>
					<div className="flex items-center justify-between">
						<h2 id="items-section-title" className="text-base font-semibold text-foreground">
							Items de la Propuesta
						</h2>
						<button
							type="button"
							onClick={() => append({ description: "", unit: "lote", quantity: 1, unitCost: 0 })}
							className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
						>
							<Plus aria-hidden="true" className="size-3.5" />
							Agregar item
						</button>
					</div>

					{errors.items && (
						<p className="mt-2 text-xs text-destructive" role="alert">
							{errors.items.message ?? errors.items.root?.message}
						</p>
					)}

					<div className="mt-4 space-y-3">
						{fields.map((field, index) => {
							const qty = watchedItems?.[index]?.quantity ?? 0;
							const cost = watchedItems?.[index]?.unitCost ?? 0;
							const itemTotal = calcItemTotal(qty, cost);

							return (
								<div
									key={field.id}
									className="rounded-lg border border-border-subtle bg-surface-secondary p-4"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 space-y-3">
											<div className="grid gap-3 sm:grid-cols-2">
												<div className="sm:col-span-2">
													<label
														htmlFor={`items.${index}.description`}
														className="block text-xs font-medium text-[var(--text-tertiary)]"
													>
														Descripción
													</label>
													<input
														id={`items.${index}.description`}
														type="text"
														{...register(`items.${index}.description`)}
														placeholder="Descripción del item"
														className="input-field mt-0.5"
													/>
													{errors.items?.[index]?.description && (
														<p className="mt-0.5 text-xs text-[var(--color-danger)]">
															{errors.items[index]?.description?.message}
														</p>
													)}
												</div>
												<div>
													<label
														htmlFor={`items.${index}.unit`}
														className="block text-xs font-medium text-[var(--text-tertiary)]"
													>
														Unidad
													</label>
													<input
														id={`items.${index}.unit`}
														type="text"
														{...register(`items.${index}.unit`)}
														placeholder="lote"
														className="input-field mt-0.5"
													/>
												</div>
												<div>
													<label
														htmlFor={`items.${index}.quantity`}
														className="block text-xs font-medium text-[var(--text-tertiary)]"
													>
														Cantidad
													</label>
													<input
														id={`items.${index}.quantity`}
														type="number"
														min={0.01}
														step={0.01}
														{...register(`items.${index}.quantity`, { valueAsNumber: true })}
														className="input-field mt-0.5"
													/>
												</div>
												<div>
													<label
														htmlFor={`items.${index}.unitCost`}
														className="block text-xs font-medium text-[var(--text-tertiary)]"
													>
														Valor unitario (COP)
													</label>
													<input
														id={`items.${index}.unitCost`}
														type="number"
														min={0}
														step={1000}
														{...register(`items.${index}.unitCost`, { valueAsNumber: true })}
														className="input-field mt-0.5"
													/>
												</div>
											</div>
										</div>
										<div className="flex flex-col items-end gap-1">
											<p className="whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">
												{formatCOP(itemTotal)}
											</p>
											{fields.length > 1 && (
												<button
													type="button"
													onClick={() => remove(index)}
													className="rounded p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
													aria-label={`Eliminar item ${index + 1}`}
												>
													<Trash2 aria-hidden="true" className="size-4" />
												</button>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* Cost summary */}
				<section
					className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
					aria-labelledby="cost-breakdown-title"
				>
					<h2
						id="cost-breakdown-title"
						className="text-base font-semibold text-[var(--text-primary)]"
					>
						Resumen de Costos
					</h2>
					<div className="mt-4 space-y-2 border-b border-[var(--border-subtle)] pb-4">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Subtotal</span>
							<span className="font-medium text-foreground">{formatCOP(subtotal)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">IVA (19%)</span>
							<span className="font-medium text-foreground">{formatCOP(taxAmount)}</span>
						</div>
					</div>
					<div className="mt-4 flex justify-between">
						<span className="text-base font-semibold text-foreground">Total</span>
						<span className="text-xl font-bold text-brand">{formatCOP(total)}</span>
					</div>
				</section>

				{/* Notes */}
				<section
					className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
					aria-labelledby="notes-section-title"
				>
					<h2
						id="notes-section-title"
						className="text-base font-semibold text-[var(--text-primary)]"
					>
						Notas y Términos
					</h2>
					<div className="mt-4">
						<label
							htmlFor="notes"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Notas adicionales
						</label>
						<textarea
							id="notes"
							rows={4}
							{...register("notes")}
							placeholder="Condiciones de pago, tiempo de entrega, garantías, etc."
							className="input-field mt-1"
						/>
						{errors.notes?.message && (
							<p className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
								{errors.notes.message}
							</p>
						)}
					</div>
				</section>

				{mutation.isError && (
					<div
						role="alert"
						className="rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
					>
						{mutation.error instanceof Error
							? mutation.error.message
							: "Error al crear la propuesta"}
					</div>
				)}

				<div className="flex justify-end gap-3">
					<Link
						href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/proposals"}
						className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
					>
						Cancelar
					</Link>
					<button type="submit" disabled={isSubmitting} className="btn-primary min-w-[160px]">
						{isSubmitting ? (
							<>
								<Loader2 aria-hidden="true" className="size-4 animate-spin" />
								Creando…
							</>
						) : (
							"Crear Propuesta"
						)}
					</button>
				</div>
			</form>
		</section>
	);
}
