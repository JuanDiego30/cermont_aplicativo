"use client";

/**
 * /admin/personnel — Matriz de habilidades y certificaciones del personal.
 */

import type { User, UserCertification } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, CalendarClock, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";

const PERSONNEL_KEYS = {
	all: ["personnel"] as const,
	users: () => [...PERSONNEL_KEYS.all, "users"] as const,
	expiring: () => [...PERSONNEL_KEYS.all, "expiring-certifications"] as const,
};

interface ExpiringCertification {
	userId: string;
	userName: string;
	certification: string;
	certificationNumber?: string;
	expiresAt?: string;
	expired: boolean;
}

function usePersonnel() {
	return useQuery({
		queryKey: PERSONNEL_KEYS.users(),
		queryFn: async () => {
			const envelope = await apiClient.get<{ success: boolean; data: User[] }>(
				"/users?limit=100&isActive=true",
			);
			return envelope.data;
		},
	});
}

function useExpiringCertifications() {
	return useQuery({
		queryKey: PERSONNEL_KEYS.expiring(),
		queryFn: async () => {
			const envelope = await apiClient.get<{ success: boolean; data: ExpiringCertification[] }>(
				"/users/expiring-certifications?days=30",
			);
			return envelope.data;
		},
	});
}

export default function AdminPersonnelPage() {
	const queryClient = useQueryClient();
	const { data: users, isLoading, error, refetch } = usePersonnel();
	const { data: expiring } = useExpiringCertifications();
	const [certDrafts, setCertDrafts] = useState<Record<string, { name: string; expiresAt: string }>>(
		{},
	);

	const addCertMutation = useMutation({
		mutationFn: async ({ userId, cert }: { userId: string; cert: UserCertification }) =>
			apiClient.post(`/users/${userId}/certifications`, cert),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PERSONNEL_KEYS.all });
		},
	});

	const removeCertMutation = useMutation({
		mutationFn: async ({ userId, name }: { userId: string; name: string }) =>
			apiClient.delete(`/users/${userId}/certifications/${encodeURIComponent(name)}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PERSONNEL_KEYS.all });
		},
	});

	const technicalUsers = useMemo(
		() => (users ?? []).filter((user) => user.role !== "cliente"),
		[users],
	);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton variant="text" className="h-8 w-64" />
				<Skeleton variant="chart" height={300} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
				<p className="text-[var(--color-danger)]">Error al cargar el personal.</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
				>
					Reintentar
				</button>
			</div>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="personnel-title">
			<header>
				<h1 id="personnel-title" className="text-xl font-semibold text-[var(--text-primary)]">
					Personal y certificaciones
				</h1>
				<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
					Certificaciones de trabajo seguro (alturas, confinados, eléctrico) por persona.
				</p>
			</header>

			{(expiring ?? []).length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/40 p-4">
					<h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-warning)]">
						<CalendarClock className="size-4" aria-hidden="true" />
						Certificaciones por vencer (30 días)
					</h2>
					<ul className="space-y-1">
						{(expiring ?? []).map((item) => (
							<li
								key={`${item.userId}-${item.certification}`}
								className="text-xs text-[var(--text-primary)]"
							>
								<span className="font-medium">{item.userName}</span> — {item.certification}
								{item.expiresAt
									? ` (vence ${new Date(item.expiresAt).toLocaleDateString("es-CO")})`
									: ""}
								{item.expired && (
									<span className="ml-1 font-medium text-[var(--color-danger)]">VENCIDA</span>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{technicalUsers.length === 0 ? (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] p-16 text-center">
					<p className="text-[var(--text-secondary)]">No hay personal activo registrado.</p>
				</div>
			) : (
				<ul className="space-y-3">
					{technicalUsers.map((user) => {
						const draft = certDrafts[user._id] ?? { name: "", expiresAt: "" };
						return (
							<li
								key={user._id}
								className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="min-w-0">
										<p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
										<p className="text-xs capitalize text-[var(--text-tertiary)]">
											{user.role.replace(/_/g, " ")}
										</p>
										<div className="mt-2 flex flex-wrap gap-1.5">
											{(user.certifications ?? []).length === 0 && (
												<span className="text-xs text-[var(--text-tertiary)]">
													Sin certificaciones
												</span>
											)}
											{(user.certifications ?? []).map((cert) => (
												<span
													key={cert.name}
													className="flex items-center gap-1 rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]"
												>
													<Award className="size-3" aria-hidden="true" />
													{cert.name}
													{cert.expiresAt
														? ` · ${new Date(cert.expiresAt).toLocaleDateString("es-CO")}`
														: ""}
													<button
														type="button"
														onClick={() =>
															removeCertMutation.mutate({ userId: user._id, name: cert.name })
														}
														className="ml-0.5 rounded-full hover:text-[var(--color-danger)]"
														aria-label={`Eliminar certificación ${cert.name}`}
													>
														<X className="size-3" aria-hidden="true" />
													</button>
												</span>
											))}
										</div>
									</div>

									<form
										className="flex shrink-0 flex-wrap items-end gap-2"
										onSubmit={(e) => {
											e.preventDefault();
											if (!draft.name.trim()) {
												return;
											}
											addCertMutation.mutate({
												userId: user._id,
												cert: {
													name: draft.name.trim(),
													issuedAt: new Date().toISOString(),
													...(draft.expiresAt
														? { expiresAt: new Date(draft.expiresAt).toISOString() }
														: {}),
												},
											});
											setCertDrafts((prev) => ({
												...prev,
												[user._id]: { name: "", expiresAt: "" },
											}));
										}}
									>
										<label className="flex flex-col gap-1 text-[10px] font-medium text-[var(--text-tertiary)]">
											Certificación
											<input
												value={draft.name}
												onChange={(e) =>
													setCertDrafts((prev) => ({
														...prev,
														[user._id]: { ...draft, name: e.target.value },
													}))
												}
												placeholder="Trabajo en alturas"
												className="w-44 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
											/>
										</label>
										<label className="flex flex-col gap-1 text-[10px] font-medium text-[var(--text-tertiary)]">
											Vence
											<input
												type="date"
												value={draft.expiresAt}
												onChange={(e) =>
													setCertDrafts((prev) => ({
														...prev,
														[user._id]: { ...draft, expiresAt: e.target.value },
													}))
												}
												className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
											/>
										</label>
										<button
											type="submit"
											disabled={addCertMutation.isPending}
											className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-brand-blue)] px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
										>
											<Plus className="size-3.5" aria-hidden="true" />
											Agregar
										</button>
									</form>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
