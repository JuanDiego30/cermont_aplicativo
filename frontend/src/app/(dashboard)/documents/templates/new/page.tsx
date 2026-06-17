"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";

const TEMPLATE_KEYS = {
	all: ["template-drafts"] as const,
	list: () => [...TEMPLATE_KEYS.all, "list"] as const,
};

const INPUT_CLASS =
	"w-full rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20 transition-colors";

const LABEL_CLASS = "block text-sm font-medium text-[var(--text-secondary)] mb-1";

export default function NewTemplatePage() {
	const { push, back } = useRouter();
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [purpose, setPurpose] = useState("");

	const createMutation = useMutation({
		mutationFn: async (data: { name: string; purpose: string }) => {
			const res = await apiClient.post<{ success: boolean; data: { _id: string } }>(
				"/template-drafts",
				data,
			);
			return res.data;
		},
		onSuccess: (data) => {
			toast.success("Plantilla creada correctamente");
			queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
			push(`/documents/templates/${data._id}`);
		},
		onError: () => {
			toast.error("Error al crear la plantilla");
		},
	});

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim() || !purpose.trim()) {
			toast.error("Todos los campos son requeridos");
			return;
		}
		createMutation.mutate({ name: name.trim(), purpose: purpose.trim() });
	}

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-template-title">
			<h1 id="new-template-title" className="text-xl font-semibold text-[var(--text-primary)]">
				Nueva Plantilla
			</h1>

			<form
				onSubmit={handleSubmit}
				className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
			>
				<div>
					<label htmlFor="template-name" className={LABEL_CLASS}>
						Nombre
					</label>
					<input
						id="template-name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Ej: Informe técnico de inspección"
						className={INPUT_CLASS}
						required
					/>
				</div>

				<div>
					<label htmlFor="template-purpose" className={LABEL_CLASS}>
						Propósito
					</label>
					<textarea
						id="template-purpose"
						value={purpose}
						onChange={(e) => setPurpose(e.target.value)}
						placeholder="Describe el propósito de esta plantilla..."
						rows={4}
						className={INPUT_CLASS}
						required
					/>
				</div>

				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						disabled={createMutation.isPending}
						className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
					>
						{createMutation.isPending ? "Creando..." : "Crear Plantilla"}
					</button>
					<button
						type="button"
						onClick={() => back()}
						className="rounded-full border border-[var(--border-medium)] px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)]"
					>
						Cancelar
					</button>
				</div>
			</form>
		</section>
	);
}
