"use client";

import type { CreateProposalInput } from "@cermont/shared-types";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateProposal } from "@/modules/proposals/hooks/useCreateProposal";

interface ProposalFormData {
	clientName: string;
	description: string;
	estimatedValue: number;
}

export default function NewProposalPage() {
	const { push } = useRouter();
	const [formData, setFormData] = useState<ProposalFormData>({
		clientName: "",
		description: "",
		estimatedValue: 0,
	});
	const [errorMessage, setErrorMessage] = useState("");
	const mutation = useCreateProposal();
	const isSubmitting = mutation.isPending;

	const handleClientNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((current) => ({ ...current, clientName: event.target.value }));
	};

	const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setFormData((current) => ({ ...current, description: event.target.value }));
	};

	const handleEstimatedValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((current) => ({ ...current, estimatedValue: Number(event.target.value) }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage("");

		try {
			const clientName = formData.clientName.trim();
			const description = formData.description.trim();
			const subtotal = Number(formData.estimatedValue);
			const validUntil = new Date();
			validUntil.setDate(validUntil.getDate() + 30);

			const payload: CreateProposalInput = {
				title: `Propuesta para ${clientName}`,
				clientName,
				validUntil: validUntil.toISOString(),
				items: [
					{
						description,
						unit: "lote",
						quantity: 1,
						unitCost: subtotal,
					},
				],
				notes: description,
			};

			const result = await mutation.mutateAsync(payload);
			push(`/proposals/${result._id}`);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : "Error al crear la propuesta");
		}
	};

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-proposal-title">
			<div className="flex items-center gap-3">
				<Link
					href="/proposals"
					className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					Volver
				</Link>
				<h1
					id="new-proposal-title"
					className="text-2xl font-semibold text-zinc-900 dark:text-white"
				>
					Nueva Propuesta
				</h1>
			</div>

			<section
				className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
				aria-labelledby="new-proposal-form-title"
			>
				<h2 id="new-proposal-form-title" className="sr-only">
					Formulario de nueva propuesta
				</h2>
				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Cliente */}
					<div>
						<label
							htmlFor="proposal-cliente"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Cliente{" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<input
							id="proposal-cliente"
							name="cliente"
							type="text"
							value={formData.clientName}
							onChange={handleClientNameChange}
							required
							placeholder="Nombre del cliente"
							className="input-field mt-1"
						/>
					</div>

					{/* Descripción */}
					<div>
						<label
							htmlFor="proposal-descripcion"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Descripción{" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<textarea
							id="proposal-descripcion"
							name="descripcion"
							value={formData.description}
							onChange={handleDescriptionChange}
							required
							rows={4}
							placeholder="Descripción del servicio o trabajo propuesto"
							className="input-field mt-1"
						/>
					</div>

					{/* Valor Estimado */}
					<div>
						<label
							htmlFor="proposal-valor-estimado"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Valor Estimado (COP){" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<input
							id="proposal-valor-estimado"
							name="valorEstimado"
							type="number"
							value={formData.estimatedValue}
							onChange={handleEstimatedValueChange}
							required
							min={1}
							placeholder="0"
							className="input-field mt-1"
						/>
					</div>

					{errorMessage.length > 0 && (
						<div
							role="alert"
							className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
						>
							{errorMessage}
						</div>
					)}

					<div className="flex justify-end gap-3 pt-2">
						<Link
							href="/proposals"
							className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
						>
							Cancelar
						</Link>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
						>
							{isSubmitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
							Crear Propuesta
						</button>
					</div>
				</form>
			</section>
		</section>
	);
}
