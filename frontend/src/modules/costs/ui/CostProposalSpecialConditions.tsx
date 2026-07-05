"use client";

import type { CostProposalInputSchema } from "@cermont/shared-types";
import type { Control, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { z } from "zod";
import { Checkbox } from "@/core/ui/FormField";
import { FormField, TextField } from "@/modules/core";

type CostProposalFormValues = z.input<typeof CostProposalInputSchema>;

interface CostProposalSpecialConditionsProps {
	control: Control<CostProposalFormValues>;
	register: UseFormRegister<CostProposalFormValues>;
}

export function CostProposalSpecialConditions({
	control,
	register,
}: CostProposalSpecialConditionsProps) {
	return (
		<section className="space-y-4">
			<header>
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
					Condiciones especiales
				</h3>
			</header>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Controller
					name="requiresHeightWork"
					control={control}
					render={({ field }) => (
						<Checkbox
							label="Trabajo en altura"
							checked={field.value}
							onChange={field.onChange}
							name={field.name}
						/>
					)}
				/>
				<Controller
					name="nightWork"
					control={control}
					render={({ field }) => (
						<Checkbox
							label="Trabajo nocturno"
							checked={field.value}
							onChange={field.onChange}
							name={field.name}
						/>
					)}
				/>
				<Controller
					name="requiresHotWork"
					control={control}
					render={({ field }) => (
						<Checkbox
							label="Trabajo en caliente"
							checked={field.value}
							onChange={field.onChange}
							name={field.name}
						/>
					)}
				/>
				<Controller
					name="adverseWeather"
					control={control}
					render={({ field }) => (
						<Checkbox
							label="Clima adverso"
							checked={field.value}
							onChange={field.onChange}
							name={field.name}
						/>
					)}
				/>
				<Controller
					name="requiresFinalCertification"
					control={control}
					render={({ field }) => (
						<Checkbox
							label="Requiere certificación final"
							checked={field.value}
							onChange={field.onChange}
							name={field.name}
						/>
					)}
				/>
				<Controller
					name="requiresLockoutTagout"
					control={control}
					render={({ field }) => (
						<Checkbox
							label="Requiere Lockout/Tagout"
							checked={field.value}
							onChange={field.onChange}
							name={field.name}
						/>
					)}
				/>
			</div>

			<FormField label="Presupuesto del cliente (opcional)">
				<TextField
					type="number"
					placeholder="Presupuesto máximo en COP"
					min={0}
					{...register("clientBudget", { valueAsNumber: true })}
				/>
			</FormField>
		</section>
	);
}
