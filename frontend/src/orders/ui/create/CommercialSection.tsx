"use client";

import { useFormContext } from "react-hook-form";
import { FormField, Select, TextField } from "@/core";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import { type NewOrderFormData, toOptionalNumber, toOptionalString } from "./types";

export function CommercialSection() {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();
	const isBillable = watch("commercial.isBillable");

	return (
		<SectionPanel title="Comercial">
			<label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
				<input type="checkbox" className="h-4 w-4" {...register("commercial.isBillable")} />
				La OT es facturable
			</label>
			<FieldGrid>
				<FormField
					name="commercial.clientName"
					htmlFor="order-clientName"
					label="Cliente / contratante"
					error={getError(errors, "commercial.clientName")}
					required={isBillable}
				>
					<TextField
						id="order-clientName"
						placeholder="Ej: SierraCol Energy"
						{...register("commercial.clientName")}
					/>
				</FormField>
				<FormField
					name="commercial.billingAccount"
					htmlFor="order-billingAccount"
					label="Cuenta de facturación"
					error={getError(errors, "commercial.billingAccount")}
					required={isBillable}
				>
					<TextField id="order-billingAccount" {...register("commercial.billingAccount")} />
				</FormField>
				<FormField
					name="commercial.poNumber"
					htmlFor="order-poNumber"
					label="N° PO / Orden de compra"
					error={getError(errors, "commercial.poNumber")}
					required={isBillable}
				>
					<TextField id="order-poNumber" {...register("commercial.poNumber")} />
				</FormField>
				<FormField
					name="commercial.contractNumber"
					htmlFor="order-contractNumber"
					label="N° contrato"
					error={getError(errors, "commercial.contractNumber")}
				>
					<TextField id="order-contractNumber" {...register("commercial.contractNumber")} />
				</FormField>
				<FormField
					name="commercial.businessUnit"
					htmlFor="order-businessUnit"
					label="Unidad de negocio"
					error={getError(errors, "commercial.businessUnit")}
					required={isBillable}
				>
					<Select
						id="order-businessUnit"
						{...register("commercial.businessUnit", { setValueAs: toOptionalString })}
					>
						<option value="">Seleccionar...</option>
						<option value="IT">IT</option>
						<option value="MNT">MNT</option>
						<option value="SC">SC</option>
						<option value="GEN">GEN</option>
					</Select>
				</FormField>
				<FormField
					name="commercial.priceListName"
					htmlFor="order-priceListName"
					label="Lista de precios"
					error={getError(errors, "commercial.priceListName")}
				>
					<TextField id="order-priceListName" {...register("commercial.priceListName")} />
				</FormField>
				<FormField
					name="commercial.nteAmount"
					htmlFor="order-nteAmount"
					label="Presupuesto no-a-exceder"
					error={getError(errors, "commercial.nteAmount")}
					required={isBillable}
				>
					<TextField
						id="order-nteAmount"
						type="number"
						step="1"
						{...register("commercial.nteAmount", { setValueAs: toOptionalNumber })}
					/>
				</FormField>
				<FormField
					name="commercial.proposalReference"
					htmlFor="order-proposalReference"
					label="Propuesta económica asociada"
					error={getError(errors, "commercial.proposalReference")}
				>
					<TextField id="order-proposalReference" {...register("commercial.proposalReference")} />
				</FormField>
			</FieldGrid>
		</SectionPanel>
	);
}
