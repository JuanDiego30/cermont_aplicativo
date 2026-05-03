"use client";

import { useFormContext } from "react-hook-form";
import { FormField, Select, TextField } from "@/core";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import type { NewOrderFormData } from "./types";

export function AssignmentSection() {
	const {
		register,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();

	return (
		<SectionPanel title="Asignación y equipo">
			<FieldGrid>
				<FormField
					name="resourceAssignment.technicianIds.0"
					htmlFor="order-technician"
					label="Técnico principal"
					error={getError(errors, "resourceAssignment.technicianIds")}
				>
					<TextField
						id="order-technician"
						placeholder="ObjectId del técnico"
						{...register("resourceAssignment.technicianIds.0" as never)}
					/>
				</FormField>
				<FormField
					name="resourceAssignment.employeeType"
					htmlFor="order-employeeType"
					label="Tipo de empleado"
					error={getError(errors, "resourceAssignment.employeeType")}
				>
					<Select id="order-employeeType" {...register("resourceAssignment.employeeType")}>
						<option value="">Seleccionar...</option>
						<option value="in_house">Propio</option>
						<option value="subcontractor">Subcontratista</option>
					</Select>
				</FormField>
				<FormField
					name="resourceAssignment.supervisorId"
					htmlFor="order-supervisorId"
					label="Supervisor / Ing. residente"
					error={getError(errors, "resourceAssignment.supervisorId")}
				>
					<TextField
						id="order-supervisorId"
						placeholder="ObjectId del supervisor"
						{...register("resourceAssignment.supervisorId")}
					/>
				</FormField>
				<FormField
					name="resourceAssignment.hesResponsibleId"
					htmlFor="order-hesResponsibleId"
					label="Responsable HES"
					error={getError(errors, "resourceAssignment.hesResponsibleId")}
				>
					<TextField
						id="order-hesResponsibleId"
						placeholder="ObjectId del responsable HES"
						{...register("resourceAssignment.hesResponsibleId")}
					/>
				</FormField>
				<FormField
					name="resourceAssignment.requiredCertifications.0"
					htmlFor="order-certifications"
					label="Certificación requerida"
					error={getError(errors, "resourceAssignment.requiredCertifications")}
				>
					<TextField
						id="order-certifications"
						placeholder="Ej: Trabajo en alturas"
						{...register("resourceAssignment.requiredCertifications.0" as never)}
					/>
				</FormField>
				<FormField
					name="resourceAssignment.vehicleResourceId"
					htmlFor="order-vehicleResourceId"
					label="Vehículo / transporte"
					error={getError(errors, "resourceAssignment.vehicleResourceId")}
				>
					<TextField
						id="order-vehicleResourceId"
						placeholder="ObjectId del recurso"
						{...register("resourceAssignment.vehicleResourceId")}
					/>
				</FormField>
			</FieldGrid>
		</SectionPanel>
	);
}
