"use client";

interface NotificationTypePref {
	type: string;
	label: string;
	enabled: boolean;
}

interface Props {
	preferences: NotificationTypePref[];
	onToggle: (type: string, enabled: boolean) => void;
}

export function NotificationPreferences({ preferences, onToggle }: Props) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-[var(--text-secondary)]">
				Selecciona qué notificaciones quieres recibir en la aplicación.
			</p>
			<div className="divide-y divide-[var(--border-subtle)]">
				{preferences.map((pref) => (
					<label key={pref.type} className="flex items-center justify-between py-3">
						<span className="text-sm text-[var(--text-primary)]">{pref.label}</span>
						<input
							type="checkbox"
							checked={pref.enabled}
							onChange={(e) => onToggle(pref.type, e.target.checked)}
							className="size-5 accent-[var(--color-brand-blue)]"
						/>
					</label>
				))}
			</div>
		</div>
	);
}
