"use client";

/**
 * /maintenance/schedules — Maintenance schedule list and creation
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useReducer, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";

type Schedule = {
	_id: string;
	title: string;
	frequency: string;
	status: string;
	nextDueAt?: string;
	assetId: { _id: string; name: string; code: string };
};

const FREQ_LABELS: Record<string, string> = {
	daily: "Diario",
	weekly: "Semanal",
	monthly: "Mensual",
	quarterly: "Trimestral",
	yearly: "Anual",
};

const STATUS_STYLES: Record<string, string> = {
	active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	paused: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	completed: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
	cancelled: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

type FormState = {
	title: string;
	frequency: string;
	assetId: string;
	startDate: string;
};

type FormAction =
	| { key: "title"; value: string }
	| { key: "frequency"; value: string }
	| { key: "assetId"; value: string }
	| { key: "startDate"; value: string }
	| { type: "reset" };

function formReducer(state: FormState, action: FormAction): FormState {
	if ("type" in action && action.type === "reset") {
		return { title: "", frequency: "monthly", assetId: "", startDate: "" };
	}
	if ("key" in action) {
		return { ...state, [action.key]: action.value };
	}
	return state;
}

const INITIAL_FORM: FormState = { title: "", frequency: "monthly", assetId: "", startDate: "" };

export default function MaintenanceSchedulesPage() {
	const queryClient = useQueryClient();
	const [showForm, setShowForm] = useState(false);
	const [form, dispatch] = useReducer(formReducer, INITIAL_FORM);

	const { data, isLoading, error, refetch } = useQuery<Schedule[]>({
		queryKey: ["maintenance-schedules"],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: Schedule[] }>(
				"/maintenance/schedules",
			);
			return json.data;
		},
	});

	const createMutation = useMutation({
		mutationFn: async () => {
			await apiClient.post("/maintenance/schedules", {
				title: form.title,
				frequency: form.frequency,
				assetId: form.assetId,
				startDate: form.startDate,
			});
		},
		onSuccess: () => {
			toast.success("Programación creada");
			setShowForm(false);
			dispatch({ type: "reset" });
			queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});

	return (
		<section className="space-y-6" aria-labelledby="schedules-title">
			<header className="flex items-center justify-between">
				<div>
					<h1 id="schedules-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Programación de mantenimiento
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{(data ?? []).length} programaciones
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowForm(!showForm)}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<Plus className="size-4" /> Nueva
				</button>
			</header>

			{showForm && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 space-y-3">
					<div>
						<label
							htmlFor="sched-title"
							className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
						>
							Título
						</label>
						<input
							id="sched-title"
							value={form.title}
							onChange={(e) => dispatch({ key: "title", value: e.target.value })}
							className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-2 text-sm"
						/>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<div>
							<label
								htmlFor="sched-freq"
								className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
							>
								Frecuencia
							</label>
							<select
								id="sched-freq"
								value={form.frequency}
								onChange={(e) => dispatch({ key: "frequency", value: e.target.value })}
								className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-2 text-sm"
							>
								{Object.entries(FREQ_LABELS).map(([k, v]) => (
									<option key={k} value={k}>
										{v}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								htmlFor="sched-asset"
								className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
							>
								Activo ID
							</label>
							<input
								id="sched-asset"
								value={form.assetId}
								onChange={(e) => dispatch({ key: "assetId", value: e.target.value })}
								className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label
								htmlFor="sched-start"
								className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
							>
								Inicio
							</label>
							<input
								id="sched-start"
								type="date"
								value={form.startDate}
								onChange={(e) => dispatch({ key: "startDate", value: e.target.value })}
								className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-2 text-sm"
							/>
						</div>
					</div>
					<button
						type="button"
						disabled={createMutation.isPending || !form.title || !form.assetId || !form.startDate}
						onClick={() => createMutation.mutate()}
						className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
					>
						{createMutation.isPending ? "Creando…" : "Crear programación"}
					</button>
				</div>
			)}

			{isLoading && <Skeleton variant="list-item" rows={3} />}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-4 text-sm text-[var(--color-danger)]">
					Error al cargar programaciones.{" "}
					<button type="button" onClick={() => refetch()} className="underline">
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !error && (data ?? []).length === 0 && (
				<EmptyState
					icon="maintenance"
					title="Sin programaciones"
					description="No hay programaciones de mantenimiento."
				/>
			)}

			{(data ?? []).length > 0 && (
				<div className="space-y-2">
					{(data ?? []).map((s) => (
						<div
							key={s._id}
							className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3"
						>
							<div className="min-w-0">
								<Link
									href={`/maintenance/schedules/${s._id}`}
									className="text-sm font-medium text-[var(--text-primary)] hover:underline"
								>
									{s.title}
								</Link>
								<p className="text-xs text-[var(--text-tertiary)]">
									{FREQ_LABELS[s.frequency] ?? s.frequency} —{" "}
									{s.assetId?.name ?? s.assetId?.code ?? "—"}
									{s.nextDueAt
										? ` — Próximo: ${new Date(s.nextDueAt).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}`
										: ""}
								</p>
							</div>
							<span
								className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[s.status] ?? ""}`}
							>
								{s.status}
							</span>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
