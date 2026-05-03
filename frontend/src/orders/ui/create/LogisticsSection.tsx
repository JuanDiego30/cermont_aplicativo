"use client";

import { useFormContext } from "react-hook-form";
import { FormField, TextArea, TextField } from "@/core";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import { type NewOrderFormData, toOptionalNumber } from "./types";

export function LogisticsSection() {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();
	const requiresSpecialTransport = watch("logistics.requiresSpecialTransport");

	return (
		<SectionPanel title="Materiales y logística">
			<FieldGrid>
				<FormField
					name="logistics.additionalMaterials.0.name"
					htmlFor="order-additionalMaterialName"
					label="Material/herramienta adicional"
					error={getError(errors, "logistics.additionalMaterials")}
				>
					<TextField
						id="order-additionalMaterialName"
						placeholder="Ítem fuera del kit estándar"
						{...register("logistics.additionalMaterials.0.name" as never)}
					/>
				</FormField>
				<FormField
					name="logistics.additionalMaterials.0.quantity"
					htmlFor="order-additionalMaterialQty"
					label="Cantidad"
					error={getError(errors, "logistics.additionalMaterials.0.quantity")}
				>
					<TextField
						id="order-additionalMaterialQty"
						type="number"
						step="0.5"
						{...register("logistics.additionalMaterials.0.quantity" as never, {
							setValueAs: toOptionalNumber,
						})}
					/>
				</FormField>
				<FormField
					name="logistics.additionalMaterials.0.unit"
					htmlFor="order-additionalMaterialUnit"
					label="Unidad"
					error={getError(errors, "logistics.additionalMaterials.0.unit")}
				>
					<TextField
						id="order-additionalMaterialUnit"
						placeholder="unidad"
						{...register("logistics.additionalMaterials.0.unit" as never)}
					/>
				</FormField>
			</FieldGrid>
			<FormField
				name="logistics.siteAccessNotes"
				htmlFor="order-siteAccessNotes"
				label="Notas de acceso al sitio"
				error={getError(errors, "logistics.siteAccessNotes")}
			>
				<TextArea id="order-siteAccessNotes" rows={3} {...register("logistics.siteAccessNotes")} />
			</FormField>
			<label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
				<input
					type="checkbox"
					className="h-4 w-4"
					{...register("logistics.requiresSpecialTransport")}
				/>
				Requiere transporte especial
			</label>
			{requiresSpecialTransport ? (
				<FormField
					name="logistics.specialTransportDescription"
					htmlFor="order-specialTransportDescription"
					label="Descripción del transporte especial"
					error={getError(errors, "logistics.specialTransportDescription")}
				>
					<TextArea
						id="order-specialTransportDescription"
						rows={2}
						{...register("logistics.specialTransportDescription")}
					/>
				</FormField>
			) : null}
			<FormField
				name="logistics.specialTools"
				htmlFor="order-specialTools"
				label="Herramientas especiales requeridas"
				error={getError(errors, "logistics.specialTools")}
			>
				<TextArea id="order-specialTools" rows={3} {...register("logistics.specialTools")} />
			</FormField>
		</SectionPanel>
	);
}
