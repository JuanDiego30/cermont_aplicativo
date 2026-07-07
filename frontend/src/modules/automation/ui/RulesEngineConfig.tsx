"use client";

import {
	ALL_AUTHENTICATED_ROLES,
	ROLE_LABELS,
	resolveUserRole,
	type UserRole,
} from "@cermont/domain";
import {
	type AutomationAction,
	type AutomationActionType,
	AutomationActionTypeSchema,
	type AutomationEventType,
	AutomationEventTypeSchema,
	type CreateAutomationRuleInput,
} from "@cermont/shared-types";
import { Cog, Loader2, Plus, Workflow } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { FormField, Select, TextArea, TextField } from "@/core/ui/FormField";
import { useAutomationRules, useCreateAutomationRule, useUpdateAutomationRule } from "../queries";
import { OperationalActionsPanel } from "./OperationalActionsPanel";

const EVENT_LABELS: Record<AutomationEventType, string> = {
	evidence_rejected: "Evidencia rechazada",
	vehicle_document_expiring: "Documento vehicular por vencer",
	tool_certificate_expiring: "Certificado de herramienta por vencer",
	cost_threshold_exceeded: "Umbral de costo excedido",
	critical_checklist_failed: "Checklist crítico fallido",
	ses_approved: "SES aprobada",
	invoice_overdue: "Factura vencida",
};

const ACTION_LABELS: Record<AutomationActionType, string> = {
	notify: "Notificar",
	create_task: "Crear tarea",
	block_transition: "Bloquear transición",
	return_to_execution: "Retornar a ejecución",
	request_evidence: "Solicitar evidencia",
	flag_risk: "Marcar riesgo",
};

type RuleDraft = {
	name: string;
	description: string;
	eventType: AutomationEventType;
	actionType: AutomationActionType;
	targetRole: UserRole;
};

const INITIAL_DRAFT: RuleDraft = {
	name: "",
	description: "",
	eventType: "evidence_rejected",
	actionType: "notify",
	targetRole: "gerente",
};

function buildAction(draft: RuleDraft): AutomationAction {
	if (draft.actionType === "notify") {
		return {
			type: "notify",
			recipientRoles: [draft.targetRole],
			priority: "high",
			title: draft.name,
			body: draft.description,
		};
	}
	if (draft.actionType === "create_task") {
		return {
			type: "create_task",
			assignedRole: draft.targetRole,
			title: draft.name,
			reason: draft.description,
			dueHours: 24,
		};
	}
	if (draft.actionType === "flag_risk") {
		return { type: "flag_risk", riskLevel: "high", label: draft.name };
	}
	return { type: draft.actionType, reason: draft.description };
}

function RuleStateButton({ ruleId, enabled }: { ruleId: string; enabled: boolean }) {
	const mutation = useUpdateAutomationRule(ruleId);
	return (
		<Button
			type="button"
			size="sm"
			variant={enabled ? "secondary" : "primary"}
			loading={mutation.isPending}
			onClick={() => mutation.mutate({ enabled: !enabled })}
		>
			{enabled ? "Pausar" : "Activar"}
		</Button>
	);
}

export function RulesEngineConfig() {
	const [draft, setDraft] = useState<RuleDraft>(INITIAL_DRAFT);
	const rulesQuery = useAutomationRules();
	const createMutation = useCreateAutomationRule();

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const input: CreateAutomationRuleInput = {
			name: draft.name.trim(),
			description: draft.description.trim(),
			eventType: draft.eventType,
			actions: [buildAction(draft)],
			enabled: true,
		};
		createMutation.mutate(input, { onSuccess: () => setDraft(INITIAL_DRAFT) });
	}

	return (
		<section aria-labelledby="automation-rules-title" className="border-t border-hairline pt-8">
			<header className="flex items-start gap-3">
				<div className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--color-brand-blue)]">
					<Workflow className="size-4" aria-hidden="true" />
				</div>
				<div>
					<h2
						id="automation-rules-title"
						className="text-base font-semibold text-ink dark:text-white"
					>
						Automatizaciones operativas
					</h2>
					<p className="mt-1 text-sm text-steel dark:text-stone">
						Reglas auditables SI‑ENTONCES ejecutadas una sola vez por evento.
					</p>
				</div>
			</header>

			<form
				onSubmit={submit}
				className="mt-5 grid gap-4 border-l-2 border-[var(--color-brand-blue)] bg-[var(--surface-secondary)] p-5 md:grid-cols-2"
			>
				<FormField label="Nombre" htmlFor="automation-name" required>
					<TextField
						id="automation-name"
						required
						minLength={3}
						value={draft.name}
						onChange={(event) => setDraft({ ...draft, name: event.target.value })}
					/>
				</FormField>
				<FormField label="Cuando ocurra" htmlFor="automation-event" required>
					<Select
						id="automation-event"
						value={draft.eventType}
						onChange={(event) =>
							setDraft({ ...draft, eventType: AutomationEventTypeSchema.parse(event.target.value) })
						}
					>
						{AutomationEventTypeSchema.options.map((eventType) => (
							<option key={eventType} value={eventType}>
								{EVENT_LABELS[eventType]}
							</option>
						))}
					</Select>
				</FormField>
				<FormField label="Entonces" htmlFor="automation-action" required>
					<Select
						id="automation-action"
						value={draft.actionType}
						onChange={(event) =>
							setDraft({
								...draft,
								actionType: AutomationActionTypeSchema.parse(event.target.value),
							})
						}
					>
						{AutomationActionTypeSchema.options.map((actionType) => (
							<option key={actionType} value={actionType}>
								{ACTION_LABELS[actionType]}
							</option>
						))}
					</Select>
				</FormField>
				<FormField label="Rol responsable" htmlFor="automation-role" required>
					<Select
						id="automation-role"
						value={draft.targetRole}
						onChange={(event) =>
							setDraft({ ...draft, targetRole: resolveUserRole(event.target.value) })
						}
					>
						{ALL_AUTHENTICATED_ROLES.map((role) => (
							<option key={role} value={role}>
								{ROLE_LABELS[role]}
							</option>
						))}
					</Select>
				</FormField>
				<FormField
					label="Descripción o instrucción"
					htmlFor="automation-description"
					required
					className="md:col-span-2"
				>
					<TextArea
						id="automation-description"
						required
						value={draft.description}
						onChange={(event) => setDraft({ ...draft, description: event.target.value })}
					/>
				</FormField>
				<div className="md:col-span-2">
					<Button
						type="submit"
						loading={createMutation.isPending}
						disabled={!draft.name.trim() || !draft.description.trim()}
					>
						<Plus aria-hidden="true" /> Crear regla
					</Button>
				</div>
			</form>

			<div className="mt-5">
				{rulesQuery.isLoading ? (
					<div className="flex items-center gap-2 py-8 text-sm text-steel">
						<Loader2 className="size-4 animate-spin" aria-hidden="true" /> Cargando reglas
					</div>
				) : rulesQuery.isError ? (
					<p role="alert" className="py-6 text-sm text-brand-error">
						No fue posible consultar las automatizaciones.
					</p>
				) : rulesQuery.data?.length === 0 ? (
					<p className="border-y border-dashed border-hairline py-6 text-sm text-steel">
						No hay reglas configuradas. El procesamiento manual permanece sin cambios.
					</p>
				) : (
					<ul className="divide-y divide-hairline border-y border-hairline">
						{rulesQuery.data?.map((rule) => (
							<li
								key={rule._id}
								className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
							>
								<div>
									<div className="flex items-center gap-2">
										<Cog className="size-4 text-steel" aria-hidden="true" />
										<p className="font-medium text-ink dark:text-white">{rule.name}</p>
									</div>
									<p className="mt-1 text-xs text-steel">
										{EVENT_LABELS[rule.eventType]} →{" "}
										{rule.actions.map((action) => ACTION_LABELS[action.type]).join(", ")} · v
										{rule.version}
									</p>
								</div>
								<RuleStateButton ruleId={rule._id} enabled={rule.enabled} />
							</li>
						))}
					</ul>
				)}
			</div>
			<OperationalActionsPanel />
		</section>
	);
}
