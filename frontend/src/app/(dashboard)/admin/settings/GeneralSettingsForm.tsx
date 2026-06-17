"use client";

import type { SystemConfig, UpdateSystemSettings } from "@cermont/shared-types";
import { Save, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { FormField, TextArea, TextField } from "@/core/ui/FormField";
import { SettingsSwitch } from "./SettingsSwitch";

interface GeneralSettingsFormProps {
	config: SystemConfig;
	isPending: boolean;
	onSave: (settings: UpdateSystemSettings) => void;
}

export function GeneralSettingsForm({ config, isPending, onSave }: GeneralSettingsFormProps) {
	// Parent uses key prop to reset state when config changes — no useEffect needed
	const [maintenanceMode, setMaintenanceMode] = useState(() => config.maintenanceMode);
	const [maintenanceMessage, setMaintenanceMessage] = useState(() => config.maintenanceMessage);
	const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(() => config.maxUploadSizeMb);
	const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(
		() => config.sessionTimeoutMinutes,
	);

	return (
		<section
			className="space-y-5 rounded-xl border border-hairline bg-canvas p-5 dark:border-zinc-700 dark:bg-canvas"
			aria-labelledby="general-settings-title"
		>
			<h2
				id="general-settings-title"
				className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white"
			>
				<Settings2 className="size-4" aria-hidden="true" />
				Ajustes generales
			</h2>

			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-ink dark:text-white">Modo mantenimiento</p>
					<p className="text-xs text-steel dark:text-stone">
						Deshabilita el acceso para usuarios no administradores.
					</p>
				</div>
				<SettingsSwitch
					checked={maintenanceMode}
					label="Modo mantenimiento"
					onChange={setMaintenanceMode}
					tone="warning"
				/>
			</div>

			{maintenanceMode ? (
				<FormField
					htmlFor="maintenance-message"
					label="Mensaje de mantenimiento"
					helperText="Este mensaje se presenta mientras el modo mantenimiento está activo."
				>
					<TextArea
						id="maintenance-message"
						value={maintenanceMessage}
						onChange={(event) => setMaintenanceMessage(event.target.value)}
						maxLength={500}
						placeholder="Sistema en mantenimiento programado..."
					/>
				</FormField>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField htmlFor="max-upload-size" label="Tamaño máximo de subida (MB)">
					<TextField
						id="max-upload-size"
						type="number"
						value={maxUploadSizeMb}
						onChange={(event) => setMaxUploadSizeMb(Number(event.target.value))}
						min={1}
						max={100}
					/>
				</FormField>
				<FormField htmlFor="session-timeout" label="Tiempo de sesión (minutos)">
					<TextField
						id="session-timeout"
						type="number"
						value={sessionTimeoutMinutes}
						onChange={(event) => setSessionTimeoutMinutes(Number(event.target.value))}
						min={30}
						max={1440}
					/>
				</FormField>
			</div>

			<div className="flex justify-end">
				<Button
					type="button"
					variant="primary"
					loading={isPending}
					onClick={() =>
						onSave({
							maintenanceMode,
							maintenanceMessage,
							maxUploadSizeMb,
							sessionTimeoutMinutes,
						})
					}
				>
					<Save aria-hidden="true" />
					Guardar ajustes
				</Button>
			</div>
		</section>
	);
}
