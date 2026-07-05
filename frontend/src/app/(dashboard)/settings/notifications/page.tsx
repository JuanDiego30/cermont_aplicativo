"use client";

import { useState } from "react";
import { NotificationPreferences } from "@/modules/notifications/ui/NotificationPreferences";

const DEFAULT_PREFS = [
	{ type: "evidence_rejected", label: "Evidencia rechazada", enabled: true },
	{ type: "evidence_approved", label: "Evidencia aprobada", enabled: true },
	{ type: "ses_approved", label: "SES aprobada", enabled: true },
	{ type: "ses_rejected", label: "SES rechazada", enabled: true },
	{ type: "payment_received", label: "Pago recibido", enabled: true },
	{ type: "report_generated", label: "Informe generado", enabled: false },
	{ type: "overdue", label: "Recordatorios de vencimiento", enabled: true },
];

export default function NotificationPreferencesPage() {
	const [prefs, setPrefs] = useState(DEFAULT_PREFS);

	const handleToggle = (type: string, enabled: boolean) => {
		setPrefs((prev) => prev.map((p) => (p.type === type ? { ...p, enabled } : p)));
	};

	return (
		<div className="p-4 md:p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
						Preferencias de notificaciones
					</h1>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Configura qué notificaciones recibir en la aplicación
					</p>
				</div>
			</div>
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
				<NotificationPreferences preferences={prefs} onToggle={handleToggle} />
			</div>
		</div>
	);
}
