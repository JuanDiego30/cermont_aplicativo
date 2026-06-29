"use client";

import { useMutation } from "@tanstack/react-query";
import { Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/http/api-client";

export function PasskeyManager() {
	const [passkeys, setPasskeys] = useState<Array<{ id: string; label: string; createdAt: string }>>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load existing passkeys
	useCallback(async () => {
		try {
			const data = await apiClient.get<{ success: boolean; data: Array<{ id: string; label: string; createdAt: string }> }>(
				"/auth/passkeys",
			);
			setPasskeys(data.data);
		} catch {
			// Passkey listing not available
		} finally {
			setIsLoading(false);
		}
	}, []);

	const registerMutation = useMutation({
		mutationFn: async () => {
			const options = await apiClient.post<{ success: boolean; data: PublicKeyCredentialCreationOptions }>(
				"/auth/passkeys/register/options", {},
			);
			const credential = await navigator.credentials.create({ publicKey: options.data });
			await apiClient.post("/auth/passkeys/register/verify", { credential });
		},
		onSuccess: () => {
			toast.success("Llave de acceso registrada");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al registrar llave de acceso");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (credentialId: string) => {
			await apiClient.delete(`/auth/passkeys/${credentialId}`);
		},
		onSuccess: () => {
			toast.success("Llave de acceso eliminada");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al eliminar llave de acceso");
		},
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
					Agregar
				</button>
			</div>

			{passkeys.length === 0 && (
				<p className="text-xs text-[var(--text-tertiary)]">
					No hay llaves de acceso registradas. Agrega una para iniciar sesión sin contraseña.
				</p>
			)}

			{passkeys.length > 0 && (
				<div className="space-y-2">
					{passkeys.map((pk) => (
						<div key={pk.id} className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-2.5">
							<div>
								<p className="text-xs font-medium text-[var(--text-primary)]">{pk.label}</p>
								<p className="text-[10px] text-[var(--text-tertiary)]">Creada: {new Date(pk.createdAt).toLocaleDateString("es-CO")}</p>
							</div>
							<button
								type="button"
								onClick={() => deleteMutation.mutate(pk.id)}
								className="rounded-full p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
								aria-label="Eliminar llave"
							>
								<Trash2 className="size-3.5" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
