"use client";

import type { RequiredCertification } from "@cermont/shared-types";
import { Award, CheckCircle, Plus, Trash2, XCircle } from "lucide-react";

interface CertificationsStepProps {
	certifications: RequiredCertification[];
	onCertificationsChange: (certs: RequiredCertification[]) => void;
}

const PRESET_CERTIFICATIONS = [
	"Trabajo Seguro en Alturas (Avanzado)",
	"Ingreso a Espacios Confinados",
	"Matrícula Profesional CONTE (Eléctrica)",
	"Certificación de Operador de Montacargas/Grúa",
	"Inducción SGSST Cermont",
];

export function CertificationsStep({
	certifications,
	onCertificationsChange,
}: CertificationsStepProps) {
	const addCertification = (name: string) => {
		onCertificationsChange([
			...certifications,
			{
				name,
				requiredForRoles: [],
				verified: true,
				expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
			},
		]);
	};

	const removeCertification = (idx: number) => {
		onCertificationsChange(certifications.filter((_, i) => i !== idx));
	};

	const toggleVerified = (idx: number) => {
		const copy = [...certifications];
		copy[idx] = { ...copy[idx], verified: !copy[idx].verified };
		onCertificationsChange(copy);
	};

	const handleDateChange = (idx: number, dateStr: string) => {
		const copy = [...certifications];
		copy[idx] = { ...copy[idx], expiresAt: dateStr ? new Date(dateStr).toISOString() : undefined };
		onCertificationsChange(copy);
	};

	const handleCustomAdd = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const input = form.elements.namedItem("customCert") as HTMLInputElement;
		if (input?.value.trim()) {
			addCertification(input.value.trim());
			input.value = "";
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-bold text-[var(--text-primary)]">
					Paso 4: Certificaciones y Habilitaciones del Personal
				</h2>
				<p className="text-sm text-[var(--text-secondary)]">
					Registre las certificaciones críticas exigidas para las actividades y verifique su
					vigencia.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-[1fr_2fr]">
				{/* Presets Sidebar */}
				<div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/30 p-5">
					<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
						Certificaciones Comunes
					</h3>
					<div className="flex flex-col gap-2">
						{PRESET_CERTIFICATIONS.map((name) => {
							const isAlreadyAdded = certifications.some(
								(c) => c.name.toLowerCase() === name.toLowerCase(),
							);
							return (
								<button
									key={name}
									type="button"
									disabled={isAlreadyAdded}
									onClick={() => addCertification(name)}
									className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium border transition-colors ${
										isAlreadyAdded
											? "border-transparent bg-zinc-200/50 text-zinc-400 dark:bg-zinc-800/40"
											: "border-[var(--border-subtle)] bg-[var(--surface-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
									}`}
								>
									<span className="truncate">{name}</span>
									{!isAlreadyAdded && <Plus className="size-3.5 shrink-0" />}
								</button>
							);
						})}
					</div>

					<form
						onSubmit={handleCustomAdd}
						className="mt-4 border-t border-[var(--border-subtle)] pt-4 space-y-2"
					>
						<label
							htmlFor="customCert"
							className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
						>
							Agregar Personalizada
						</label>
						<div className="flex gap-2">
							<input
								id="customCert"
								type="text"
								placeholder="Ej: Curso Técnico..."
								className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
							/>
							<button
								type="submit"
								className="rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-green-deep)] text-white px-3 py-1.5 text-xs font-semibold"
							>
								+
							</button>
						</div>
					</form>
				</div>

				{/* Selected Certifications */}
				<div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
					<h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
						Certificaciones a Evaluar
					</h3>

					{certifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-muted)]">
							<Award className="size-12 mb-3 opacity-30" />
							<p className="text-xs">No hay certificaciones agregadas para este paquete.</p>
							<p className="text-[10px] mt-0.5">
								Use el panel lateral para seleccionar o crear una certificación.
							</p>
						</div>
					) : (
						<div className="divide-y divide-[var(--border-subtle)]">
							{certifications.map((cert, i) => (
								<div
									key={cert.name}
									className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
								>
									<div className="flex-1">
										<p className="text-sm font-semibold text-[var(--text-primary)]">{cert.name}</p>
										<p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
											Roles asociados: General
										</p>
									</div>

									<div className="flex items-center gap-3">
										<div className="flex flex-col gap-1">
											<span className="text-[9px] font-semibold text-[var(--text-muted)]">
												Fecha de Vencimiento
											</span>
											<input
												type="date"
												aria-label="Fecha de vencimiento"
												value={cert.expiresAt ? cert.expiresAt.slice(0, 10) : ""}
												onChange={(e) => handleDateChange(i, e.target.value)}
												className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
											/>
										</div>

										<button
											type="button"
											onClick={() => toggleVerified(i)}
											className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
												cert.verified
													? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
													: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
											}`}
										>
											{cert.verified ? (
												<CheckCircle className="size-3" />
											) : (
												<XCircle className="size-3" />
											)}
											{cert.verified ? "Vigente" : "Vencida"}
										</button>

										<button
											type="button"
											aria-label="Eliminar certificación"
											onClick={() => removeCertification(i)}
											className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-xl transition-colors"
										>
											<Trash2 className="size-4" />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
