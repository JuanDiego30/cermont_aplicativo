"use client";

import type { CreateProposalInput } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { ArrowLeft, InfoIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { resolveCreatedProposalId } from "@/modules/proposals/api/proposals.service";
import { useCreateProposal } from "@/modules/proposals/hooks/useCreateProposal";
import { StepBreadcrumb } from "@/modules/service-cases/components/StepBreadcrumb";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";
import { InheritedFieldGroup } from "@/modules/workflow";
import { ProposalClientInfo } from "./ProposalClientInfo";
import { ProposalCostSummary } from "./ProposalCostSummary";
import { ProposalLineItems } from "./ProposalLineItems";
import { ProposalNotesSection } from "./ProposalNotesSection";
import { ProposalFormSchema, type ProposalFormValues } from "./proposal-form-schema";

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
		setError,
		clearErrors,
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

	const onSubmit = (data: ProposalFormValues) => {
		clearErrors("root");
		const payload: CreateProposalInput = {
			title: `Propuesta para ${data.clientName.trim()}`,
			clientName: data.clientName.trim(),
			...(data.clientEmail?.trim() ? { clientEmail: data.clientEmail.trim() } : {}),
			validUntil: new Date(data.validUntil).toISOString(),
			items: data.items.map((item) => ({
				description: item.description.trim(),
				unit: item.unit.trim(),
				quantity: item.quantity,
				unitCost: item.unitCost,
			})),
			...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
			...(serviceCaseId ? { serviceCaseId } : {}),
		};

		mutation.mutate(payload, {
			onSuccess: (result) => {
				if (serviceCaseId) {
					push(`/service-cases/${serviceCaseId}`);
					return;
				}

				const resolution = resolveCreatedProposalId(result);
				if (resolution.status === "invalid") {
					setError("root", { type: "server", message: resolution.message });
					return;
				}

				push(`/proposals/${resolution.id}`);
			},
		});
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

			<StepBreadcrumb />

			{serviceCaseId && (
				<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/20 dark:border-blue-800">
					<div className="flex items-start gap-3">
						<InfoIcon className="mt-0.5 size-5 text-blue-600 dark:text-blue-400" />
						<div>
							<p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
								Propuesta vinculada a caso de servicio
							</p>
							<p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
								Esta propuesta se vinculará automáticamente al caso. Al guardar, podrás continuar
								con el flujo de aprobación.
							</p>
						</div>
					</div>
				</div>
			)}

			{!isContextLoading && (
				<InheritedFieldGroup
					title="Datos heredados del caso"
					fields={inheritedFields.slice(0, 6)}
					readOnly
				/>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
				<ProposalClientInfo register={register} errors={errors} />
				<ProposalLineItems
					fields={fields}
					watchedItems={watchedItems}
					register={register}
					errors={errors}
					append={append}
					remove={remove}
					formatCOP={formatCOP}
					calcItemTotal={calcItemTotal}
				/>
				<ProposalCostSummary
					subtotal={subtotal}
					taxAmount={taxAmount}
					total={total}
					formatCOP={formatCOP}
				/>
				<ProposalNotesSection register={register} errors={errors} />

				{(mutation.isError || errors.root) && (
					<div
						role="alert"
						className="rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
					>
						{errors.root?.message ??
							(mutation.error instanceof Error
								? mutation.error.message
								: "Error al crear la propuesta")}
					</div>
				)}

				<div className="flex justify-end gap-3">
					<Link
						href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/proposals"}
						className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
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
