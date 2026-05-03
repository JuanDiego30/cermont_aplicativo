"use client";

import { useFormContext } from "react-hook-form";
import { FormField, Select, TextField } from "@/core";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import { type NewOrderFormData, toIsoDateTimeValue, toOptionalNumber } from "./types";

export function ScheduleSlaSection() {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();
	const recurrenceEnabled = watch("scheduleSla.recurrence.enabled");

	return (
		<SectionPanel title="Programación y SLA">
			<FieldGrid>
				<FormField
					name="scheduleSla.scheduledStartAt"
					htmlFor="order-scheduledStartAt"
					label="Fecha y hora programada de inicio"
					error={getError(errors, "scheduleSla.scheduledStartAt")}
				>
					<TextField
						id="order-scheduledStartAt"
						type="datetime-local"
						{...register("scheduleSla.scheduledStartAt", { setValueAs: toIsoDateTimeValue })}
					/>
				</FormField>
				<FormField
					name="scheduleSla.dueAt"
					htmlFor="order-dueAt"
					label="Fecha límite SLA"
					error={getError(errors, "scheduleSla.dueAt")}
				>
					<TextField
						id="order-dueAt"
						type="datetime-local"
						{...register("scheduleSla.dueAt", { setValueAs: toIsoDateTimeValue })}
					/>
				</FormField>
				<FormField
					name="scheduleSla.estimatedDuration.value"
					htmlFor="order-duration"
					label="Duración estimada"
					error={getError(errors, "scheduleSla.estimatedDuration.value")}
				>
					<TextField
						id="order-duration"
						type="number"
						step="0.5"
						{...register("scheduleSla.estimatedDuration.value", { setValueAs: toOptionalNumber })}
					/>
				</FormField>
				<FormField
					name="scheduleSla.estimatedDuration.unit"
					htmlFor="order-duration-unit"
					label="Unidad duración"
					error={getError(errors, "scheduleSla.estimatedDuration.unit")}
				>
					<Select id="order-duration-unit" {...register("scheduleSla.estimatedDuration.unit")}>
						<option value="hours">Horas</option>
						<option value="days">Días</option>
					</Select>
				</FormField>
				<FormField
					name="scheduleSla.responseLevel"
					htmlFor="order-responseLevel"
					label="Nivel de respuesta requerido"
					error={getError(errors, "scheduleSla.responseLevel")}
				>
					<Select id="order-responseLevel" {...register("scheduleSla.responseLevel")}>
						<option value="">Seleccionar...</option>
						<option value="emergency">Emergencia</option>
						<option value="urgent">Urgente</option>
						<option value="standard">Estándar</option>
						<option value="scheduled">Programado</option>
					</Select>
				</FormField>
				<FormField
					name="scheduleSla.maintenanceWindow.startTime"
					htmlFor="order-window-start"
					label="Ventana desde"
					error={getError(errors, "scheduleSla.maintenanceWindow.startTime")}
				>
					<TextField
						id="order-window-start"
						type="time"
						{...register("scheduleSla.maintenanceWindow.startTime")}
					/>
				</FormField>
				<FormField
					name="scheduleSla.maintenanceWindow.endTime"
					htmlFor="order-window-end"
					label="Ventana hasta"
					error={getError(errors, "scheduleSla.maintenanceWindow.endTime")}
				>
					<TextField
						id="order-window-end"
						type="time"
						{...register("scheduleSla.maintenanceWindow.endTime")}
					/>
				</FormField>
			</FieldGrid>
			<label className="flex min-h-11 items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
				<input
					type="checkbox"
					className="h-4 w-4"
					{...register("scheduleSla.recurrence.enabled")}
				/>
				Recurrencia
			</label>
			{recurrenceEnabled ? (
				<FieldGrid>
					<FormField
						name="scheduleSla.recurrence.frequency"
						htmlFor="order-recurrence-frequency"
						label="Frecuencia"
						error={getError(errors, "scheduleSla.recurrence.frequency")}
					>
						<Select
							id="order-recurrence-frequency"
							{...register("scheduleSla.recurrence.frequency")}
						>
							<option value="">Seleccionar...</option>
							<option value="daily">Diaria</option>
							<option value="weekly">Semanal</option>
							<option value="monthly">Mensual</option>
							<option value="quarterly">Trimestral</option>
							<option value="yearly">Anual</option>
						</Select>
					</FormField>
					<FormField
						name="scheduleSla.recurrence.endsAt"
						htmlFor="order-recurrence-endsAt"
						label="Fin de recurrencia"
						error={getError(errors, "scheduleSla.recurrence.endsAt")}
					>
						<TextField
							id="order-recurrence-endsAt"
							type="datetime-local"
							{...register("scheduleSla.recurrence.endsAt", { setValueAs: toIsoDateTimeValue })}
						/>
					</FormField>
				</FieldGrid>
			) : null}
		</SectionPanel>
	);
}
