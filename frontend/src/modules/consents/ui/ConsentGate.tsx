"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const CONSENT_KEY = "cermont-consent-accepted";

function getConsentAccepted(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return localStorage.getItem(CONSENT_KEY) === "true";
}

function setConsentAccepted(): void {
	try {
		localStorage.setItem(CONSENT_KEY, "true");
	} catch {
		// localStorage not available
	}
}

export function ConsentGate() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const accepted = getConsentAccepted();
		if (!accepted) {
			const timer = setTimeout(() => setShow(true), 2000);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleAccept = useCallback(() => {
		setConsentAccepted();
		setShow(false);
	}, []);

	if (!show) {
		return null;
	}

	return (
		<aside
			className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-3)]"
			aria-label="Aviso de privacidad"
		>
			<div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<ShieldCheck
						className="mt-0.5 size-5 shrink-0 text-[var(--color-brand-blue)]"
						aria-hidden="true"
					/>
					<div>
						<p className="text-sm font-medium text-[var(--text-primary)]">Aviso de privacidad</p>
						<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
							Utilizamos tus datos únicamente para la operación del sistema. Consulta nuestra{" "}
							<Link
								href="/privacy"
								className="font-medium text-[var(--color-brand-blue)] hover:underline"
							>
								Política de Privacidad
							</Link>{" "}
							y{" "}
							<Link
								href="/consent"
								className="font-medium text-[var(--color-brand-blue)] hover:underline"
							>
								términos de consentimiento
							</Link>
							.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={handleAccept}
					className="shrink-0 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					Aceptar
				</button>
			</div>
		</aside>
	);
}
