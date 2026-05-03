"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, Select, TextArea, TextField } from "@/core";
import { CheckboxGroup, FieldGrid, getError, SectionPanel } from "./form-helpers";
import type { NewOrderFormData } from "./types";

const PERMIT_OPTIONS = [
	{ value: "hot_work", label: "Trabajo en caliente" },
	{ value: "confined_space", label: "Espacio confinado" },
	{ value: "electrical", label: "Trabajo eléctrico" },
	{ value: "lifting", label: "Izaje" },
	{ value: "heights", label: "Altura" },
];

const RISK_OPTIONS = [
	{ value: "heights", label: "Trabajo en alturas" },
	{ value: "electrical", label: "Riesgo eléctrico" },
	{ value: "lifting", label: "Izaje" },
	{ value: "confined_space", label: "Espacios confinados" },
	{ value: "hazardous_substances", label: "Sustancias peligrosas" },
];

export function HesSection() {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();
	const requiresPTW = watch("hes.requiresPTW");
	const riskLevel = watch("hes.riskLevel");

	useEffect(() => {
		if (riskLevel === "critical" && !requiresPTW) {
			setValue("hes.requiresPTW", true, { shouldDirty: true, shouldValidate: true });
		}
	}, [requiresPTW, riskLevel, setValue]);

	return (
		<SectionPanel title="Seguridad HES">
			<FieldGrid>
				<FormField
					name="hes.riskLevel"
					htmlFor="order-riskLevel"
					label="Clasificación de riesgo operativo"
					error={getError(errors, "hes.riskLevel")}
				>
					<Select id="order-riskLevel" {...register("hes.riskLevel")}>
						<option value="low">Bajo</option>
						<option value="medium">Medio</option>
						<option value="high">Alto</option>
						<option value="critical">Crítico</option>
					</Select>
				</FormField>
				<FormField
					name="hes.previousPtwNumber"
					htmlFor="order-previousPtwNumber"
					label="Número de permiso PTW previo"
					error={getError(errors, "hes.previousPtwNumber")}
				>
					<TextField id="order-previousPtwNumber" {...register("hes.previousPtwNumber")} />
				</FormField>
				<FormField
					name="hes.ptwDocumentId"
					htmlFor="order-ptwDocumentId"
					label="Documento PTW firmado"
					error={getError(errors, "hes.ptwDocumentId")}
				>
					<TextField
						id="order-ptwDocumentId"
						placeholder="ObjectId del documento PTW"
						{...register("hes.ptwDocumentId")}
					/>
				</FormField>
			</FieldGrid>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input
						type="checkbox"
						className="h-4 w-4"
						{...register("hes.requiresPTW")}
						disabled={riskLevel === "critical"}
					/>
					Requiere PTW
				</label>
				<label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input type="checkbox" className="h-4 w-4" {...register("hes.requiresAST")} />
					Requiere AST
				</label>
				<label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input type="checkbox" className="h-4 w-4" {...register("hes.requiresIsolation")} />
					Requiere aislamiento
				</label>
			</div>
			{requiresPTW ? (
				<FormField
					name="hes.permitTypes"
					label="Tipo de permiso"
					error={getError(errors, "hes.permitTypes")}
					required
				>
					<CheckboxGroup
						name="hes.permitTypes"
						options={PERMIT_OPTIONS}
						legend="Tipo de permiso"
						required
					/>
				</FormField>
			) : null}
			<FormField
				name="hes.specificRisks"
				label="Riesgos específicos identificados"
				error={getError(errors, "hes.specificRisks")}
			>
				<CheckboxGroup
					name="hes.specificRisks"
					options={RISK_OPTIONS}
					legend="Riesgos específicos identificados"
				/>
			</FormField>
			<FormField
				name="hes.safetyObservations"
				htmlFor="order-safetyObservations"
				label="Observaciones de seguridad"
				error={getError(errors, "hes.safetyObservations")}
			>
				<TextArea id="order-safetyObservations" rows={3} {...register("hes.safetyObservations")} />
			</FormField>
		</SectionPanel>
	);
}
