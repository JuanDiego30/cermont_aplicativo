"use client";

import { useFormContext } from "react-hook-form";
import { FormField, Select, TextArea } from "@/core";
import { useKitTemplates } from "@/maintenance/queries";
import { PRIORITY_OPTIONS, TYPE_OPTIONS } from "../OrderFormFields";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import type { NewOrderFormData } from "./types";

export function BasicSection() {
	const {
		register,
		setValue,
		watch,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();
	const selectedType = watch("type");
	const { data: templates = [], isLoading: isLoadingTemplates } = useKitTemplates(selectedType);
	const kitTemplateRegistration = register("kitTemplateId");

	const applyKitInheritance = (kitId: string) => {
		const kit = templates.find((template) => template._id === kitId);
		if (!kit) {
			return;
		}

		if (kit.estimatedHours) {
			setValue("scheduleSla.estimatedDuration", {
				value: kit.estimatedHours,
				unit: "hours",
			});
		}

		if (kit.safety) {
			const permitTypes = kit.safety.requiredPermits
				.map((permit) => {
					const mapping = {
						heights: "heights",
						confined_space: "confined_space",
						hot_work: "hot_work",
						electrical_loto: "electrical",
						lifting: "lifting",
					} as const;
					return mapping[permit];
				})
				.filter(Boolean);
			const specificRisks = kit.safety.specificRisks
				.map((risk) => {
					const mapping = {
						electrical: "electrical",
						fall: "heights",
						chemical_contamination: "hazardous_substances",
						entrapment: "confined_space",
						explosion: "hazardous_substances",
					} as const;
					return mapping[risk];
				})
				.filter(Boolean);

			setValue("hes.riskLevel", kit.safety.riskClassification);
			setValue("hes.requiresPTW", permitTypes.length > 0);
			setValue("hes.permitTypes", permitTypes);
			setValue("hes.specificRisks", specificRisks);
			setValue("hes.requiresIsolation", kit.safety.requiresLoto);
		}

		if (kit.assignmentRules?.requiredCertifications?.length) {
			setValue(
				"resourceAssignment.requiredCertifications",
				kit.assignmentRules.requiredCertifications,
			);
		}

		if (kit.baseMaterialCost > 0) {
			setValue("commercial.nteAmount", kit.baseMaterialCost);
		}
	};

	return (
		<SectionPanel title="Identificación básica">
			<FieldGrid>
				<FormField
					name="type"
					htmlFor="order-type"
					label="Tipo de orden"
					error={getError(errors, "type")}
					required
				>
					<Select id="order-type" {...register("type")}>
						{TYPE_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
				</FormField>
				<FormField
					name="priority"
					htmlFor="order-priority"
					label="Prioridad"
					error={getError(errors, "priority")}
					required
				>
					<Select id="order-priority" {...register("priority")}>
						{PRIORITY_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
				</FormField>
				<FormField
					name="kitTemplateId"
					htmlFor="order-kitTemplateId"
					label="Plantilla de Kit Típico"
					error={getError(errors, "kitTemplateId")}
				>
					<Select
						id="order-kitTemplateId"
						{...kitTemplateRegistration}
						onChange={(event) => {
							kitTemplateRegistration.onChange(event);
							applyKitInheritance(event.target.value);
						}}
						disabled={isLoadingTemplates}
					>
						<option value="">Seleccionar un kit...</option>
						{templates.map((kit) => (
							<option key={kit._id} value={kit._id}>
								{kit.name}
							</option>
						))}
					</Select>
				</FormField>
			</FieldGrid>
			<FormField
				name="description"
				htmlFor="order-description"
				label="Descripción"
				error={getError(errors, "description")}
				required
			>
				<TextArea
					id="order-description"
					rows={4}
					placeholder="Describe el trabajo a realizar..."
					{...register("description")}
				/>
			</FormField>
		</SectionPanel>
	);
}
