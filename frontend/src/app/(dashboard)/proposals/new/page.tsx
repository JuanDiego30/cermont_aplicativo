"use client";

import type { CreateProposalInput } from "@cermont/shared-types";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useCreateProposal } from "@/proposals/hooks/useCreateProposal";

export default function NewProposalPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		clientName: "",
		description: "",
		estimatedValue: 0,
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const mutation = useCreateProposal();

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "number" ? Number(value) : value,
		}));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setErrorMessage("");
		setIsSubmitting(true);

		try {
			const clientName = formData.clientName.trim();
			const description = formData.description.trim();
			const subtotal = Number(formData.estimatedValue);
			const validUntil = new Date();
			validUntil.setDate(validUntil.getDate() + 30);

			const payload: CreateProposalInput = {
				title: `Proposal for ${clientName}`,
				clientName,
				validUntil: validUntil.toISOString(),
				items: [
					{
						description,
						unit: "batch",
						quantity: 1,
						unitCost: subtotal,
					},
				],
				notes: description,
			};

			const result = await mutation.mutateAsync(payload);
			router.push(`/proposals/${result._id}`);
		} catch (err) {
			const error = err as { response?: { data?: { message?: string } }; message?: string };
			setErrorMessage(
				error.response?.data?.message || error.message || "Proposal could not be created",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="mx-auto max-w-2xl space-y-6" aria-labelledby="new-proposal-title">
			<div className="flex items-center gap-3">
				<Link
					href="/proposals"
					className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
				>
					<ArrowLeft aria-hidden="true" className="h-4 w-4" />
					Back
				</Link>
				<h1 id="new-proposal-title" className="text-2xl font-bold text-slate-900 dark:text-white">
					New proposal
				</h1>
			</div>

			<section
				className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800"
				aria-labelledby="new-proposal-form-title"
			>
				<h2 id="new-proposal-form-title" className="sr-only">
					New proposal form
				</h2>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="proposal-client-name"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Client{" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<input
							id="proposal-client-name"
							name="clientName"
							type="text"
							value={formData.clientName}
							onChange={handleChange}
							required
							placeholder="Client name"
							className="input-field mt-1"
						/>
					</div>

					<div>
						<label
							htmlFor="proposal-description"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Description{" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<textarea
							id="proposal-description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							required
							rows={4}
							placeholder="Description of the proposed service or work"
							className="input-field mt-1"
						/>
					</div>

					<div>
						<label
							htmlFor="proposal-estimated-value"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Estimated value (COP){" "}
							<span aria-hidden="true" className="text-red-500">
								*
							</span>
						</label>
						<input
							id="proposal-estimated-value"
							name="estimatedValue"
							type="number"
							value={formData.estimatedValue}
							onChange={handleChange}
							required
							min={1}
							placeholder="0"
							className="input-field mt-1"
						/>
					</div>

					{errorMessage && (
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
							className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
						>
							Cancel
						</Link>
						<button
							type="submit"
							disabled={isSubmitting}
							className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
						>
							{isSubmitting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
							Create proposal
						</button>
					</div>
				</form>
			</section>
		</section>
	);
}
