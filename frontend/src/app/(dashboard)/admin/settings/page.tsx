"use client";

import type { FeatureFlag, SystemConfig, UpdateSystemSettings } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Shield, ToggleLeft } from "lucide-react";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { EmptyState } from "@/core/ui/EmptyState";
import {
	getSystemConfig,
	toggleSystemFeatureFlag,
	updateSystemSettings,
} from "@/modules/system-config/api";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { ReminderSettingsForm } from "./ReminderSettingsForm";
import { SettingsSwitch } from "./SettingsSwitch";

const CATEGORY_LABELS: Record<FeatureFlag["category"], string> = {
	general: "Generales",
	field: "Campo",
	billing: "Facturación",
	notifications: "Notificaciones",
	security: "Seguridad",
	experimental: "Experimentales",
};

const CATEGORY_ORDER: FeatureFlag["category"][] = [
	"general",
	"field",
	"billing",
	"notifications",
	"security",
	"experimental",
];

interface FeatureFlagCardProps {
	flag: FeatureFlag;
	isPending: boolean;
	onToggle: () => void;
}

function FeatureFlagCard({ flag, isPending, onToggle }: FeatureFlagCardProps) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-zinc-900 dark:text-white">{flag.label}</span>
					{flag.category === "experimental" ? (
						<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
							Experimental
						</span>
					) : null}
				</div>
				{flag.description ? (
					<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{flag.description}</p>
				) : null}
			</div>
			<SettingsSwitch
				checked={flag.enabled}
				disabled={isPending}
				label={flag.label}
				onChange={onToggle}
			/>
		</div>
	);
}

export default function AdminSettingsPage() {
	const queryClient = useQueryClient();
	const {
		data: config,
		isLoading: configIsLoading,
		error: configError,
	} = useQuery({
		queryKey: ["system-config"],
		queryFn: getSystemConfig,
	});
	const toggleMutation = useMutation({
		mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
			toggleSystemFeatureFlag(key, enabled),
		onSuccess: (result) => {
			queryClient.setQueryData<SystemConfig>(["system-config"], result);
		},
	});
	const settingsMutation = useMutation({
		mutationFn: (settings: UpdateSystemSettings) => updateSystemSettings(settings),
		onSuccess: (result) => {
			queryClient.setQueryData<SystemConfig>(["system-config"], result);
		},
	});

	if (configIsLoading) {
		return (
			<div className="flex justify-center py-24" aria-live="polite">
				<Loader2
					className="size-8 animate-spin text-[var(--color-brand-blue)]"
					aria-hidden="true"
				/>
				<span className="sr-only">Cargando configuración...</span>
			</div>
		);
	}

	if (configError) {
		return (
			<ErrorFallback
				title="Error al cargar configuración"
				description="No se pudo cargar la configuración del sistema."
			/>
		);
	}

	if (!config) {
		return (
			<EmptyState
				icon="settings"
				title="Sin configuración"
				description="No hay configuración del sistema disponible."
			/>
		);
	}

	const mutationError = toggleMutation.error ?? settingsMutation.error;

	return (
		<section className="mx-auto max-w-4xl space-y-8 px-4 py-8" aria-labelledby="settings-title">
			<header className="flex items-center gap-3">
				<div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
					<Shield className="size-5" aria-hidden="true" />
				</div>
				<div>
					<h1 id="settings-title" className="text-xl font-semibold text-zinc-900 dark:text-white">
						Configuración del sistema
					</h1>
					<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
						Gestiona funciones, operación y recordatorios del aplicativo.
					</p>
				</div>
			</header>

			{mutationError ? (
				<div
					className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
					role="alert"
				>
					No fue posible guardar el cambio. Revisa los datos e inténtalo nuevamente.
				</div>
			) : null}

			<section aria-labelledby="feature-flags-title">
				<h2
					id="feature-flags-title"
					className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white"
				>
					<ToggleLeft className="size-4" aria-hidden="true" />
					Características del sistema
				</h2>
				<div className="space-y-6">
					{CATEGORY_ORDER.map((category) => {
						const flags = config.featureFlags.filter((flag) => flag.category === category);
						if (flags.length === 0) {
							return null;
						}
						return (
							<div key={category}>
								<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
									{CATEGORY_LABELS[category]}
								</h3>
								<div className="space-y-2">
									{flags.map((flag) => (
										<FeatureFlagCard
											key={flag.key}
											flag={flag}
											onToggle={() =>
												toggleMutation.mutate({ key: flag.key, enabled: !flag.enabled })
											}
											isPending={toggleMutation.isPending}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<GeneralSettingsForm
				key={`general-${config.maintenanceMode}-${config.maxUploadSizeMb}-${config.sessionTimeoutMinutes}`}
				config={config}
				onSave={(settings) => settingsMutation.mutate(settings)}
				isPending={settingsMutation.isPending}
			/>
			<ReminderSettingsForm
				key={`reminders-${config.reminderWorkerEnabled}-${config.reminderWorkerIntervalMinutes}-${JSON.stringify(config.reminderRules)}`}
				config={config}
				onSave={(settings) => settingsMutation.mutate(settings)}
				isPending={settingsMutation.isPending}
			/>

			<p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
				Los cambios se aplican inmediatamente.
				{config.maintenanceMode ? (
					<span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
						<AlertTriangle className="size-3" aria-hidden="true" />
						Modo mantenimiento activo
					</span>
				) : null}
			</p>
		</section>
	);
}
