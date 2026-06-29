/**
 * Privacy request submission form
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/core/ui/Button";
import { FormField } from "@/core/ui/FormField";
import { useCreatePrivacyRequest } from "../hooks/usePrivacyRequests";

const privacyRequestSchema = z.object({
	type: z.enum(["access", "rectification", "erasure", "restriction", "portability"], {
		error: "Seleccione un tipo de solicitud",
	}),
	description: z
		.string()
		.min(10, "Describa su solicitud en al menos 10 caracteres")
		.max(2000, "Descripción demasiado larga"),
});

type PrivacyRequestFormData = z.infer<typeof privacyRequestSchema>;

const TYPE_OPTIONS: { value: PrivacyRequestFormData["type"]; label: string }[] = [
	{ value: "access", label: "Acceso a mis datos" },
	{ value: "rectification", label: "Rectificación de datos" },
	{ value: "erasure", label: "Eliminación de datos" },
	{ value: "restriction", label: "Restricción de tratamiento" },
	{ value: "portability", label: "Portabilidad de datos" },
];

export function PrivacyRequestForm() {
	const createMutation = useCreatePrivacyRequest();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<PrivacyRequestFormData>({
		resolver: zodResolver(privacyRequestSchema),
		defaultValues: { type: "access", description: "" },
	});

	const onSubmit = async (data: PrivacyRequestFormData) => {
		await createMutation.mutateAsync(data);
		reset();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
			<FormField label="Tipo de solicitud" error={errors.type?.message}>
				<select
					{...register("type")}
					className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 text-sm text-[var(--text-primary)]"
					aria-label="Tipo de solicitud de privacidad"
				>
					{TYPE_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</FormField>

			<FormField label="Descripción" error={errors.description?.message}>
				<textarea
					{...register("description")}
					rows={4}
					className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 text-sm text-[var(--text-primary)]"
					placeholder="Describa su solicitud de forma detallada..."
					aria-label="Descripción de la solicitud de privacidad"
				/>
			</FormField>

			<Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
				{createMutation.isPending ? (
					<Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
				) : (
					<Send className="mr-2 size-4" aria-hidden="true" />
				)}
				{createMutation.isPending ? "Enviando..." : "Enviar solicitud"}
			</Button>
		</form>
	);
}
