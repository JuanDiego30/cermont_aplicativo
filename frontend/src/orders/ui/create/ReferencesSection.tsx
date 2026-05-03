"use client";

import { useFormContext } from "react-hook-form";
import { FormField, TextArea, TextField } from "@/core";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import type { NewOrderFormData } from "./types";

export function ReferencesSection() {
	const {
		register,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();

	return (
		<SectionPanel title="Referencias y notas">
			<FieldGrid>
				<FormField
					name="references.attachmentDocumentIds.0"
					htmlFor="order-attachmentDocumentId"
					label="Adjunto de referencia"
					error={getError(errors, "references.attachmentDocumentIds")}
				>
					<TextField
						id="order-attachmentDocumentId"
						placeholder="ObjectId del documento"
						{...register("references.attachmentDocumentIds.0" as never)}
					/>
				</FormField>
				<FormField
					name="references.relatedOrderId"
					htmlFor="order-relatedOrderId"
					label="OT relacionada"
					error={getError(errors, "references.relatedOrderId")}
				>
					<TextField
						id="order-relatedOrderId"
						placeholder="ObjectId de la OT"
						{...register("references.relatedOrderId")}
					/>
				</FormField>
				<FormField
					name="references.parentOrderId"
					htmlFor="order-parentOrderId"
					label="Orden padre"
					error={getError(errors, "references.parentOrderId")}
				>
					<TextField
						id="order-parentOrderId"
						placeholder="ObjectId de la orden padre"
						{...register("references.parentOrderId")}
					/>
				</FormField>
				<FormField
					name="references.prerequisites.0.label"
					htmlFor="order-prerequisite"
					label="Prerequisito"
					error={getError(errors, "references.prerequisites")}
				>
					<TextField
						id="order-prerequisite"
						placeholder="Ej: permiso de ingreso aprobado"
						{...register("references.prerequisites.0.label" as never)}
					/>
				</FormField>
			</FieldGrid>
			<FormField
				name="references.technicianInstructions"
				htmlFor="order-technicianInstructions"
				label="Instrucciones para el técnico"
				error={getError(errors, "references.technicianInstructions")}
			>
				<TextArea
					id="order-technicianInstructions"
					rows={3}
					{...register("references.technicianInstructions")}
				/>
			</FormField>
			<FormField
				name="references.internalNotes"
				htmlFor="order-internalNotes"
				label="Notas internas"
				error={getError(errors, "references.internalNotes")}
			>
				<TextArea id="order-internalNotes" rows={3} {...register("references.internalNotes")} />
			</FormField>
		</SectionPanel>
	);
}
