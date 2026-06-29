"use client";

import { useMutation } from "@tanstack/react-query";
import { Fingerprint, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";

export function PasskeyManager() {
	const registerMutation = useMutation({
		mutationFn: async () => {
			const result = await apiClient.post<{
				success: boolean;
				data: PublicKeyCredentialCreationOptions;
			}>("/auth/passkeys/register/options", {});
			const credential = await navigator.credentials.create({ publicKey: result.data });
			await apiClient.post("/auth/passkeys/register/verify", { credential });
		},
		onSuccess: () => toast.success("Llave de acceso registrada"),
		onError: (err: Error) => toast.error(err.message || "Error al registrar llave de acceso"),
	});

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Fingerprint className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Llaves de acceso</h3>
				</div>
				<button
					type="button"
					onClick={() => registerMutation.mutate()}
					disabled={registerMutation.isPending}
					className="flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] disabled:opacity-50"
				>
					{registerMutation.isPending ? (
						<Loader2 className="size-3.5 animate-spin" />
					) : (
						<Plus className="size-3.5" />
					)}
					Registrar llave
				</button>
			</div>
			<p className="text-xs text-[var(--text-tertiary)]">
				Registra una llave de acceso para iniciar sesión sin contraseña usando tu huella digital,
				rostro o PIN.
			</p>
		</div>
	);
}
