"use client";

import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/core/ui/Button";
import { useAutomationOperationalActions, useResolveAutomationOperationalAction } from "../queries";

export function OperationalActionsPanel() {
	const actionsQuery = useAutomationOperationalActions("open");
	const resolveMutation = useResolveAutomationOperationalAction();

	return (
		<section
			aria-labelledby="automation-actions-title"
			className="mt-8 border-t border-hairline pt-6"
		>
			<div className="flex items-start gap-3">
				<ShieldAlert className="mt-0.5 size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
				<div>
					<h3
						id="automation-actions-title"
						className="text-sm font-semibold text-ink dark:text-white"
					>
						Acciones operativas abiertas
					</h3>
					<p className="mt-1 text-sm text-steel">
						Bloqueos, tareas y riesgos creados por reglas que aún requieren cierre humano.
					</p>
				</div>
			</div>

			{actionsQuery.isLoading ? (
				<div className="flex items-center gap-2 py-6 text-sm text-steel">
					<Loader2 className="size-4 animate-spin" aria-hidden="true" /> Cargando acciones
				</div>
			) : actionsQuery.isError ? (
				<p role="alert" className="py-6 text-sm text-brand-error">
					No fue posible consultar las acciones operativas.
				</p>
			) : actionsQuery.data?.length === 0 ? (
				<p className="mt-4 border-y border-dashed border-hairline py-5 text-sm text-steel">
					No hay acciones operativas abiertas.
				</p>
			) : (
				<ul className="mt-4 divide-y divide-hairline border-y border-hairline">
					{actionsQuery.data?.map((action) => (
						<li
							key={action._id}
							className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
						>
							<div>
								<p className="text-sm font-medium text-ink dark:text-white">{action.title}</p>
								<p className="mt-1 text-sm text-steel">{action.reason}</p>
								<p className="mt-1 text-xs text-steel">
									{action.entityType} · {action.type.replaceAll("_", " ")} · {action.priority}
								</p>
							</div>
							<Button
								type="button"
								size="sm"
								variant="secondary"
								loading={resolveMutation.isPending && resolveMutation.variables === action._id}
								disabled={resolveMutation.isPending}
								onClick={() => resolveMutation.mutate(action._id)}
							>
								<CheckCircle2 aria-hidden="true" /> Resolver acción
							</Button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
