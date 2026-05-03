"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fingerprint, KeyRound, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	deletePasskey,
	hasPlatformAuthenticator,
	listPasskeys,
	registerPasskey,
	supportsWebAuthn,
} from "@/auth/passkeys";

function formatPasskeyDate(value?: string): string {
	if (!value) {
		return "Sin uso registrado";
	}
	return new Intl.DateTimeFormat("es-CO", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export function PasskeySettings() {
	const queryClient = useQueryClient();
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const passkeysQuery = useQuery({
		queryKey: ["auth", "passkeys"],
		queryFn: listPasskeys,
	});

	const supportQuery = useQuery({
		queryKey: ["auth", "passkeys", "support"],
		queryFn: async () => supportsWebAuthn() && (await hasPlatformAuthenticator()),
		staleTime: Infinity,
	});

	const registerMutation = useMutation({
		mutationFn: () => registerPasskey("Dispositivo principal"),
		onSuccess: async () => {
			setStatusMessage("Ingreso por huella activado correctamente.");
			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deletePasskey,
		onSuccess: async () => {
			setStatusMessage("Dispositivo eliminado.");
			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
		},
	});

	const passkeys = passkeysQuery.data ?? [];
	const canUsePasskeys = supportQuery.data === true;

	return (
		<section
			className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-1)]"
			aria-labelledby="passkey-settings-title"
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-3">
					<span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-info-bg)] text-[var(--color-brand-blue)]">
						<Fingerprint className="h-5 w-5" aria-hidden="true" />
					</span>
					<div>
						<h2
							id="passkey-settings-title"
							className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]"
						>
							Ingreso por huella
						</h2>
						<p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">
							Activa un passkey para entrar con huella, PIN, Face ID o Windows Hello según tu
							dispositivo. Cermont no guarda tu huella.
						</p>
					</div>
				</div>
				<button
					type="button"
					disabled={!canUsePasskeys || registerMutation.isPending}
					onClick={() => registerMutation.mutate()}
					className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)] disabled:pointer-events-none disabled:opacity-50"
				>
					{registerMutation.isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
					) : (
						<KeyRound className="h-4 w-4" aria-hidden="true" />
					)}
					Activar en este dispositivo
				</button>
			</div>

			{!canUsePasskeys ? (
				<p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">
					Este navegador no reporta un autenticador biométrico disponible. Puedes seguir usando
					correo y contraseña.
				</p>
			) : null}

			{statusMessage ? (
				<p
					role="status"
					className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-success)]/20 bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--text-primary)]"
				>
					{statusMessage}
				</p>
			) : null}

			{registerMutation.error || deleteMutation.error ? (
				<p
					role="alert"
					className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
				>
					{(registerMutation.error ?? deleteMutation.error) instanceof Error
						? (registerMutation.error ?? deleteMutation.error)?.message
						: "No se pudo completar la acción de passkey."}
				</p>
			) : null}

			<div className="mt-5 space-y-3">
				{passkeysQuery.isLoading ? (
					<p className="text-sm text-[var(--text-secondary)]">Cargando dispositivos...</p>
				) : passkeys.length === 0 ? (
					<p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
						No tienes dispositivos con ingreso por huella activado.
					</p>
				) : (
					passkeys.map((passkey) => (
						<article
							key={passkey.credentialId}
							className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<div>
								<h3 className="text-sm font-semibold text-[var(--text-primary)]">
									{passkey.deviceLabel}
								</h3>
								<p className="text-xs text-[var(--text-secondary)]">
									Último uso: {formatPasskeyDate(passkey.lastUsedAt)}
								</p>
							</div>
							<button
								type="button"
								onClick={() => deleteMutation.mutate(passkey.credentialId)}
								disabled={deleteMutation.isPending}
								className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] disabled:pointer-events-none disabled:opacity-50"
							>
								<Trash2 className="h-4 w-4" aria-hidden="true" />
								Eliminar
							</button>
						</article>
					))
				)}
			</div>
		</section>
	);
}
