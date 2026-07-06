"use client";

import { useAuthStore } from "@/store/auth.store";

export type ActionUrgency = "normal" | "urgent" | "overdue";

export interface ActionItem {
	id: string;
	description: string;
	orderCode: string;
	deadline?: string;
	deepLink: string;
	urgency: ActionUrgency;
	/** Role the backend assigned to this action; used for role-based filtering. */
	requiredRole?: string;
}

interface Props {
	actions: ActionItem[];
}

const URGENCY_ICON_CLASS: Record<ActionUrgency, string> = {
	overdue: "text-[#F44336]",
	urgent: "text-[#FF9800]",
	normal: "text-[var(--color-brand-blue)]",
};

const URGENCY_LABEL: Record<ActionUrgency, string> = {
	overdue: "Vencida",
	urgent: "Urgente",
	normal: "Pendiente",
};

function shouldShowAction(role: string, action: ActionItem): boolean {
	if (action.requiredRole) {
		// Gerente supervises the whole pipeline; everyone else sees their own actions.
		return role === "gerente" || action.requiredRole === role;
	}
	const description = action.description.toLowerCase();
	if (role === "gerente") {
		return description.includes("aprobar") || description.includes("pago");
	}
	if (role === "administrativo") {
		return description.includes("factura") || description.includes("ses");
	}
	if (role === "tecnico" || role === "operador") {
		return (
			description.includes("ejecutar") ||
			description.includes("evidencia") ||
			description.includes("checklist")
		);
	}
	if (role === "supervisor") {
		return description.includes("supervisar") || description.includes("revisar");
	}
	if (role === "residente") {
		return description.includes("asignar") || description.includes("planificar");
	}
	return true;
}

export function NextActionsByRolePanel({ actions }: Props) {
	const userState = useAuthStore((state) => state.user);
	const role = userState.status === "present" ? userState.value.role : "cliente";

	const roleActions = actions.filter((action) => shouldShowAction(role, action));

	if (roleActions.length === 0) {
		return (
			<section
				aria-label="Próximas acciones por rol"
				className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
			>
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Próximas acciones</h3>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					No hay acciones pendientes para tu rol
				</p>
			</section>
		);
	}

	return (
		<section
			aria-label="Próximas acciones por rol"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
		>
			<header className="mb-4 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Próximas acciones</h3>
				<span className="rounded-full bg-[var(--color-brand-blue)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-blue)]">
					{roleActions.length}
				</span>
			</header>
			<ul className="space-y-3" aria-label="Lista de acciones pendientes">
				{roleActions.map((action) => (
					<li key={action.id}>
						<a
							href={action.deepLink}
							className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 transition hover:border-[var(--color-brand-blue)]/30 hover:bg-[var(--surface-secondary)]"
							aria-label={`${action.description} — ${action.orderCode} — ${URGENCY_LABEL[action.urgency]}`}
						>
							<span
								className={`mt-1 size-2 shrink-0 rounded-full ${URGENCY_ICON_CLASS[
									action.urgency
								].replace("text-", "bg-")}`}
								aria-hidden="true"
							/>
							<div className="min-w-0 flex-1 space-y-1">
								<p className="text-sm font-medium text-[var(--text-primary)]">
									{action.description}
								</p>
								<p className="text-xs text-[var(--text-secondary)]">{action.orderCode}</p>
								{action.deadline && (
									<p className="text-xs text-[var(--text-tertiary)]">
										{URGENCY_LABEL[action.urgency]} · {action.deadline}
									</p>
								)}
							</div>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}
