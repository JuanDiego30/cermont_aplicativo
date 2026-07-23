import type { Proposal } from "@cermont/shared-types";
import type { UseFormReturn } from "react-hook-form";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import type { FormValues } from "./page";

const copFormat = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const CURRENCY_OPTIONS = [
	{ value: "COP", label: "COP — Peso colombiano" },
	{ value: "USD", label: "USD — Dolar estadounidense" },
	{ value: "EUR", label: "EUR — Euro" },
] as const;

interface PurchaseOrderFormFieldsProps {
	register: UseFormReturn<FormValues>["register"];
	errors: UseFormReturn<FormValues>["formState"]["errors"];
	approvedProposals: Proposal[];
	isLoadingProposals: boolean;
}

export function PurchaseOrderFormFields({
	register,
	errors,
	approvedProposals,
	isLoadingProposals,
}: PurchaseOrderFormFieldsProps) {
	return (
		<>
			<FormField
				name="proposalId"
				label="Propuesta aprobada"
				required
				error={errors.proposalId?.message}
			>
				<Select id="proposalId" {...register("proposalId")} error={Boolean(errors.proposalId)}>
					<option value="">
						{isLoadingProposals
							? "Cargando propuestas..."
							: approvedProposals.length === 0
								? "No hay propuestas aprobadas disponibles."
								: "Seleccione una propuesta aprobada"}
					</option>
					{approvedProposals.map((p) => (
						<option key={p._id} value={p._id}>
							{p.code} — {p.clientName} — {copFormat.format(p.total)}
						</option>
					))}
				</Select>
			</FormField>

			<FormField name="poNumber" label="Numero de PO" required error={errors.poNumber?.message}>
				<TextField
					id="poNumber"
					{...register("poNumber")}
					error={Boolean(errors.poNumber)}
					placeholder="PO-2026-0001"
					autoComplete="off"
				/>
			</FormField>

			<FormField
				name="contractReference"
				label="Referencia de contrato"
				helperText="Opcional."
				error={errors.contractReference?.message}
			>
				<TextField
					id="contractReference"
					{...register("contractReference")}
					error={Boolean(errors.contractReference)}
					placeholder="CT-2026-001"
					autoComplete="off"
				/>
			</FormField>

			<FormField
				name="serviceAccount"
				label="Cuenta de servicio"
				required
				error={errors.serviceAccount?.message}
			>
				<TextField
					id="serviceAccount"
					{...register("serviceAccount")}
					error={Boolean(errors.serviceAccount)}
					placeholder="Servicio-001"
					autoComplete="off"
				/>
			</FormField>

			<FormField
				name="billingAccount"
				label="Cuenta de facturacion"
				required
				error={errors.billingAccount?.message}
			>
				<TextField
					id="billingAccount"
					{...register("billingAccount")}
					error={Boolean(errors.billingAccount)}
					placeholder="Facturacion-001"
					autoComplete="off"
				/>
			</FormField>

			<FormField
				name="approvedAmount"
				label="Monto aprobado"
				helperText="Valor numerico positivo."
				required
				error={errors.approvedAmount?.message}
			>
				<TextField
					id="approvedAmount"
					type="number"
					min="0"
					step="0.01"
					{...register("approvedAmount", { valueAsNumber: true })}
					error={Boolean(errors.approvedAmount)}
					placeholder="0.00"
					autoComplete="off"
				/>
			</FormField>

			<FormField name="currency" label="Moneda" required error={errors.currency?.message}>
				<Select
					id="currency"
					{...register("currency")}
					error={Boolean(errors.currency)}
					defaultValue="COP"
				>
					{CURRENCY_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</Select>
			</FormField>

			<FormField
				name="receivedAt"
				label="Fecha de recepcion"
				helperText="Fecha y hora local."
				required
				error={errors.receivedAt?.message}
			>
				<TextField
					id="receivedAt"
					type="datetime-local"
					{...register("receivedAt")}
					error={Boolean(errors.receivedAt)}
					autoComplete="off"
				/>
			</FormField>
		</>
	);
}
