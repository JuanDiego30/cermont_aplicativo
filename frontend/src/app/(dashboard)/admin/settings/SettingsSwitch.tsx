interface SettingsSwitchProps {
	checked: boolean;
	disabled?: boolean;
	label: string;
	onChange: (checked: boolean) => void;
	tone?: "brand" | "warning";
}

export function SettingsSwitch({
	checked,
	disabled = false,
	label,
	onChange,
	tone = "brand",
}: SettingsSwitchProps) {
	const activeClass = tone === "warning" ? "bg-amber-500" : "bg-[#2154A6]";

	return (
		<button
			type="button"
			onClick={() => onChange(!checked)}
			disabled={disabled}
			className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
				checked ? activeClass : "bg-zinc-300 dark:bg-zinc-600"
			}`}
			role="switch"
			aria-checked={checked}
			aria-label={`${label}: ${checked ? "activado" : "desactivado"}`}
		>
			<span
				className={`inline-block size-5 rounded-full bg-canvas shadow-sm transition-transform ${
					checked ? "translate-x-5" : "translate-x-0"
				}`}
			/>
		</button>
	);
}
