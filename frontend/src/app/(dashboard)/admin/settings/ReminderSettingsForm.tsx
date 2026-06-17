"use client";

import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import {
	type ReminderRule,
	ReminderRuleSchema,
	type SystemConfig,
	type UpdateSystemSettings,
} from "@cermont/shared-types";
import { BellRing, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { Checkbox, FormField, TextField } from "@/core/ui/FormField";
import { SettingsSwitch } from "./SettingsSwitch";

const REMINDER_LABELS: Record<ReminderRule["type"], string> = {
	certification_expiring: "Certificaciones próximas a vencer",
	maintenance_due: "Mantenimientos programados",
	payment_overdue: "Pagos vencidos",
	sla_breach_warning: "Riesgo de incumplimiento SLA",
	invoice_due: "Facturas próximas a vencer",
	stale_case: "Casos sin actividad",
};

const SCHEDULE_LABELS: Record<ReminderRule["scheduleMode"], string> = {
	days_before: "días antes",
	days_after: "días después",
	hours_before: "horas antes",
	inactivity_days: "días sin actividad",
};

interface ReminderSettingsFormProps {
	config: SystemConfig;
	isPending: boolean;
	onSave: (settings: UpdateSystemSettings) => void;
}

function parseThresholds(value: string): number[] {
	return value
		.split(",")
		.map((entry) => Number(entry.trim()))
		.filter((entry) => Number.isInteger(entry) && entry > 0);
}

export function ReminderSettingsForm({ config, isPending, onSave }: ReminderSettingsFormProps) {
	// Parent uses key prop to reset state when config changes — no useEffect needed
	const [workerEnabled, setWorkerEnabled] = useState(() => config.reminderWorkerEnabled);
	const [intervalMinutes, setIntervalMinutes] = useState(
		() => config.reminderWorkerIntervalMinutes,
	);
	const [rules, setRules] = useState<ReminderRule[]>(() => config.reminderRules);
	const [validationError, setValidationError] = useState("");

	function updateRule(type: ReminderRule["type"], update: Partial<ReminderRule>) {
		setRules((current) =>
			current.map((rule) => (rule.type === type ? { ...rule, ...update } : rule)),
		);
	}

	function save() {
		const parsedRules = rules.map((rule) => ReminderRuleSchema.safeParse(rule));
		const invalidRule = parsedRules.find((result) => !result.success);
		if (invalidRule && !invalidRule.success) {
			setValidationError(invalidRule.error.issues[0]?.message ?? "Hay una regla inválida.");
			return;
		}
		setValidationError("");
		onSave({
			reminderWorkerEnabled: workerEnabled,
			reminderWorkerIntervalMinutes: intervalMinutes,
			reminderRules: rules,
		});
	}

	return (
		<section
			className="space-y-5 rounded-xl border border-hairline bg-canvas p-5 dark:border-zinc-700 dark:bg-canvas"
			aria-labelledby="reminder-settings-title"
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2
						id="reminder-settings-title"
						className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white"
					>
						<BellRing className="size-4" aria-hidden="true" />
						Recordatorios operativos
					</h2>
					<p className="mt-1 text-xs text-steel dark:text-stone">
						Configura anticipación, canales y responsables sin desplegar código.
					</p>
				</div>
				<SettingsSwitch
					checked={workerEnabled}
					label="Procesador de recordatorios"
					onChange={setWorkerEnabled}
				/>
			</div>

			<FormField
				htmlFor="reminder-interval"
				label="Frecuencia de evaluación (minutos)"
				helperText="El procesador vuelve a leer esta configuración en cada ciclo."
				className="max-w-sm"
			>
				<TextField
					id="reminder-interval"
					type="number"
					value={intervalMinutes}
					onChange={(event) => setIntervalMinutes(Number(event.target.value))}
					min={1}
					max={1440}
					disabled={!workerEnabled}
				/>
			</FormField>

			<div className="space-y-3">
				{rules.map((rule) => (
					<article
						key={rule.type}
						className="space-y-4 rounded-lg border border-hairline p-4 dark:border-zinc-700"
					>
						<div className="flex items-center justify-between gap-4">
							<div>
								<h3 className="text-sm font-medium text-ink dark:text-white">
									{REMINDER_LABELS[rule.type]}
								</h3>
								<p className="text-xs text-steel dark:text-stone">
									Umbrales expresados en {SCHEDULE_LABELS[rule.scheduleMode]}.
								</p>
							</div>
							<SettingsSwitch
								checked={rule.enabled}
								disabled={!workerEnabled}
								label={REMINDER_LABELS[rule.type]}
								onChange={(enabled) => updateRule(rule.type, { enabled })}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
							<FormField
								htmlFor={`thresholds-${rule.type}`}
								label="Umbrales"
								helperText="Valores separados por comas, sin duplicados."
							>
								<TextField
									id={`thresholds-${rule.type}`}
									value={rule.thresholds.join(", ")}
									onChange={(event) =>
										updateRule(rule.type, {
											thresholds: parseThresholds(event.target.value),
										})
									}
									disabled={!workerEnabled || !rule.enabled}
									inputMode="numeric"
								/>
							</FormField>

							<fieldset disabled={!workerEnabled || !rule.enabled}>
								<legend className="mb-2 text-sm font-medium text-charcoal dark:text-muted-text">
									Canales
								</legend>
								<div className="flex flex-wrap gap-4">
									{(["in_app", "email", "sms"] as const).map((channel) => (
										<Checkbox
											key={channel}
											label={
												channel === "in_app" ? "Aplicación" : channel === "email" ? "Correo" : "SMS"
											}
											checked={rule.channels.includes(channel)}
											onChange={(event) => {
												const channels = event.target.checked
													? [...rule.channels, channel]
													: rule.channels.filter((value) => value !== channel);
												updateRule(rule.type, { channels });
											}}
										/>
									))}
								</div>
							</fieldset>
						</div>

						<fieldset disabled={!workerEnabled || !rule.enabled}>
							<legend className="mb-2 text-sm font-medium text-charcoal dark:text-muted-text">
								Roles responsables
							</legend>
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{ALL_AUTHENTICATED_ROLES.map((role) => (
									<Checkbox
										key={role}
										label={role.replaceAll("_", " ")}
										checked={rule.recipientRoles.includes(role)}
										onChange={(event) => {
											const recipientRoles = event.target.checked
												? [...rule.recipientRoles, role]
												: rule.recipientRoles.filter((value) => value !== role);
											updateRule(rule.type, { recipientRoles });
										}}
									/>
								))}
							</div>
						</fieldset>
					</article>
				))}
			</div>

			{validationError ? (
				<p className="text-sm font-medium text-brand-error dark:text-brand-error" role="alert">
					{validationError}
				</p>
			) : null}

			<div className="flex justify-end">
				<Button type="button" variant="primary" loading={isPending} onClick={save}>
					<Save aria-hidden="true" />
					Guardar recordatorios
				</Button>
			</div>
		</section>
	);
}
