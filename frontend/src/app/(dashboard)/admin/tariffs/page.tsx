"use client";

import type { CreateTariffInput, UserRole } from "@cermont/shared-types";
import { ALL_AUTHENTICATED_ROLES, ROLE_LABELS } from "@cermont/shared-types/rbac";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateTariff, useTariffs, useUpdateTariff } from "@/costs/queries";

const ROLES: UserRole[] = [...ALL_AUTHENTICATED_ROLES];

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export default function TariffsAdminPage() {
	const tariffsQuery = useTariffs();
	const createTariff = useCreateTariff();
	const updateTariff = useUpdateTariff();
	const [editingId, setEditingId] = useState("");
	const [form, setForm] = useState<CreateTariffInput>({
		role: "technician",
		hourlyRateCOP: 0,
		overtimeMultiplier: 1.5,
	});

	const submit = async () => {
		try {
			if (editingId) {
				await updateTariff.mutateAsync({ id: editingId, data: form });
				toast.success("Tarifa actualizada");
			} else {
				await createTariff.mutateAsync(form);
				toast.success("Tarifa creada");
			}
			setEditingId("");
			setForm({ role: "technician", hourlyRateCOP: 0, overtimeMultiplier: 1.5 });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo guardar la tarifa");
		}
	};

	return (
		<main className="space-y-6">
			<header>
				<h1 className="text-2xl font-bold text-[var(--text-primary)]">Tarifas de mano de obra</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Configura las tarifas vigentes por rol para calcular costos reales de ejecución.
				</p>
			</header>

			<section className="grid gap-6 lg:grid-cols-[360px_1fr]">
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void submit();
					}}
					className="space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				>
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						{editingId ? "Editar tarifa" : "Nueva tarifa"}
					</h2>
					<label htmlFor="tariff-role" className="block space-y-1">
						<span className="text-sm font-medium text-[var(--text-secondary)]">Rol</span>
						<select
							id="tariff-role"
							value={form.role}
							onChange={(event) =>
								setForm((current) => ({ ...current, role: event.target.value as UserRole }))
							}
							className="min-h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						>
							{ROLES.map((role) => (
								<option key={role} value={role}>
									{ROLE_LABELS[role] ?? role}
								</option>
							))}
						</select>
					</label>
					<label htmlFor="tariff-hourly-rate" className="block space-y-1">
						<span className="text-sm font-medium text-[var(--text-secondary)]">
							Tarifa hora COP
						</span>
						<input
							id="tariff-hourly-rate"
							type="number"
							min={0}
							value={form.hourlyRateCOP}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									hourlyRateCOP: Number(event.target.value),
								}))
							}
							className="min-h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						/>
					</label>
					<label htmlFor="tariff-overtime-multiplier" className="block space-y-1">
						<span className="text-sm font-medium text-[var(--text-secondary)]">
							Multiplicador extra
						</span>
						<input
							id="tariff-overtime-multiplier"
							type="number"
							min={1}
							step={0.1}
							value={form.overtimeMultiplier}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									overtimeMultiplier: Number(event.target.value),
								}))
							}
							className="min-h-11 w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
						/>
					</label>
					<button
						type="submit"
						disabled={createTariff.isPending || updateTariff.isPending}
						className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--shadow-brand)] disabled:opacity-50"
					>
						{createTariff.isPending || updateTariff.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
						) : (
							<Save className="h-4 w-4" aria-hidden="true" />
						)}
						Guardar tarifa
					</button>
				</form>

				<section className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
					<h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
						Tarifas registradas
					</h2>
					{tariffsQuery.isLoading ? (
						<p className="text-sm text-[var(--text-secondary)]">Cargando tarifas...</p>
					) : (tariffsQuery.data ?? []).length === 0 ? (
						<p className="text-sm text-[var(--text-secondary)]">No hay tarifas registradas.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="border-b border-[var(--border-default)] text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
									<tr>
										<th className="py-3 pr-4">Rol</th>
										<th className="px-4 py-3 text-right">Tarifa</th>
										<th className="px-4 py-3 text-right">Extra</th>
										<th className="py-3 pl-4 text-right">Acciones</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[var(--border-default)]">
									{tariffsQuery.data?.map((tariff) => (
										<tr key={tariff._id}>
											<td className="py-3 pr-4 font-medium text-[var(--text-primary)]">
												{tariff.role}
											</td>
											<td className="px-4 py-3 text-right">
												{COP_FORMATTER.format(tariff.hourlyRateCOP)}
											</td>
											<td className="px-4 py-3 text-right">{tariff.overtimeMultiplier}x</td>
											<td className="py-3 pl-4 text-right">
												<button
													type="button"
													onClick={() => {
														setEditingId(tariff._id);
														setForm({
															role: tariff.role,
															hourlyRateCOP: tariff.hourlyRateCOP,
															overtimeMultiplier: tariff.overtimeMultiplier,
															effectiveFrom: tariff.effectiveFrom,
														});
													}}
													className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
												>
													Editar
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</section>
		</main>
	);
}
