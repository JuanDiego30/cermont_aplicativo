"use client";

/**
 * /profile/privacy — Privacy requests management page
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/core/ui/EmptyState";
import { apiClient } from "@/lib/http/api-client";

type PrivacyRequest = {
	_id: string;
	requestType: string;
	status: string;
	description: string;
	createdAt: string;
};

const REQUEST_TYPES = [
	{ value: "access", label: "Acceso a datos" },
	{ value: "rectification", label: "Rectificación" },
	{ value: "cancellation", label: "Cancelación" },
	{ value: "opposition", label: "Oposición" },
	{ value: "portability", label: "Portabilidad" },
] as const;

const STATUS_STYLES: Record<string, string> = {
	pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	completed: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	rejected: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

export default function PrivacyRequestsPage() {
	const [requestType, setRequestType] = useState("");
	const [description, setDescription] = useState("");

	const { data: requests = [], isLoading, refetch } = useQuery<PrivacyRequest[]>({
		queryKey: ["privacy-requests"],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: PrivacyRequest[] }>(
				"/privacy-requests",
			);
			return json.data;
		},
	});

	const createMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post("/privacy-requests", { requestType, description });
		},
		onSuccess: () => {
			toast.success("Solicitud enviada correctamente");
			setRequestType("");
			setDescription("");
			refetch();
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al enviar la solicitud");
		},
	});

	return (
		<section className="space-y-6" aria-labelledby="privacy-title">
			<header>
				<h1 id="privacy-title" className="text-xl font-semibold text-[var(--text-primary)]">
					Solicitudes de Privacidad
				</h1>
				<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
					Ejerce tus derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
				</p>
			</header>

			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
				<h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Nueva solicitud</h2>
				<div className="space-y-3">
					<div>
						<label htmlFor="privacy-type" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
							Tipo de solicitud
						</label>
						<select
							id="privacy-type"
							value={requestType}
							onChange={(e) => setRequestType(e.target.value)}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						>
							<option value="">Selecciona un tipo</option>
							{REQUEST_TYPES.map((t) => (
								<option key={t.value} value={t.value}>{t.label}</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="privacy-desc" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
							Descripción
						</label>
						<textarea
							id="privacy-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe tu solicitud…"
							rows={3}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>
					<button
						type="button"
						disabled={!requestType || createMutation.isPending}
						onClick={() => createMutation.mutate()}
						className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
					>
						{createMutation.isPending ? "Enviando…" : "Enviar solicitud"}
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" />
				</div>
			) : requests.length === 0 ? (
				<EmptyState icon="generic" title="Sin solicitudes" description="No has realizado solicitudes de privacidad." />
			) : (
				<div className="space-y-2">
					{requests.map((req) => (
						<div
							key={req._id}
							className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3"
						>
							<div>
								<p className="text-sm font-medium text-[var(--text-primary)]">
									{REQUEST_TYPES.find((t) => t.value === req.requestType)?.label ?? req.requestType}
								</p>
								<p className="text-xs text-[var(--text-tertiary)]">{req.description}</p>
							</div>
							<span className={`rounded px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[req.status] ?? ""}`}>
								{req.status}
							</span>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
