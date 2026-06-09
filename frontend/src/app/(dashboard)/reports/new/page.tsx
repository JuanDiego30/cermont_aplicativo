"use client";

import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useCreateTechnicalReport } from "@/modules/reports/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

export default function NewTechnicalReportPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<NewTechnicalReportForm />
		</Suspense>
	);
}

function NewTechnicalReportForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const executionSessionId = searchParams.get("executionSessionId") ?? "";
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";

	const {
		workflow,
		isLoading: isContextLoading,
		inheritedFields,
	} = useServiceCaseContext("step_07_technical_report", serviceCaseId);

	const [executionSummary, setExecutionSummary] = useState("");
	const [findingsRaw, setFindingsRaw] = useState("");
	const [deviationsRaw, setDeviationsRaw] = useState("");

	const createMutation = useCreateTechnicalReport(executionSessionId);

	if (!executionSessionId) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-[var(--color-danger)]">
					Falta sesión de ejecución
				</h1>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Accede a esta página desde el cockpit del caso o desde la sesión de ejecución.
				</p>
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/execution"}
					className="mt-4 inline-block text-sm font-medium text-[var(--color-brand)] hover:underline"
				>
					{serviceCaseId ? "Volver al caso" : "Ir a ejecuciones"}
				</Link>
			</div>
		);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!executionSummary.trim()) {
			toast.error("El resumen de ejecución es requerido");
			return;
		}

		const findings = findingsRaw
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);

		const deviations = deviationsRaw
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);

		createMutation.mutate(
			{
				executionSummary: executionSummary.trim(),
				findings: findings.length > 0 ? findings : undefined,
				deviations: deviations.length > 0 ? deviations : undefined,
			},
			{
				onSuccess: (response) => {
					toast.success("Informe técnico creado");
					const reportId = (response as { data?: { _id?: string } }).data?._id;
					if (reportId) {
						router.push(`/reports/${reportId}`);
					} else if (serviceCaseId) {
						router.push(`/service-cases/${serviceCaseId}`);
					} else {
						router.push(`/execution/${executionSessionId}`);
					}
				},
				onError: (err) => {
					toast.error("Error al crear el informe", { description: err.message });
				},
			},
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-report-title">
			<header className="space-y-3">
				<Link
					href={
						serviceCaseId ? `/service-cases/${serviceCaseId}` : `/execution/${executionSessionId}`
					}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Paso 7 / Informe técnico</p>
					<h1
						id="new-report-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Nuevo informe técnico
					</h1>
					{workflow && (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{workflow.code} — {workflow.clientName}
						</p>
					)}
					<p className="mt-1 text-xs text-[var(--text-muted)]">
						Sesión: <code className="font-mono">{executionSessionId}</code>
					</p>
				</div>
			</header>

			{/* Inherited context banner */}
			{!isContextLoading && inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<div className="mb-2 flex items-center gap-2">
						<Info className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
						<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
							Datos del caso
						</p>
					</div>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{inheritedFields.slice(0, 6).map((field) => (
							<div key={field.key} className="rounded-[var(--radius-md)] bg-white/70 px-3 py-2">
								<p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
									{field.label}
								</p>
								<p className="mt-0.5 truncate text-sm font-semibold text-[var(--text-primary)]">
									{field.value}
								</p>
								<p className="text-[9px] text-[var(--color-brand)]">↑ {field.sourceStepLabel}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				noValidate
			>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<label
							htmlFor="executionSummary"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Resumen de ejecución <span className="text-red-500">*</span>
						</label>
						<textarea
							id="executionSummary"
							required
							rows={5}
							value={executionSummary}
							onChange={(e) => setExecutionSummary(e.target.value)}
							placeholder="Describe el trabajo realizado, condiciones encontradas y resultados obtenidos..."
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="findings" className="text-sm font-medium text-[var(--text-primary)]">
							Hallazgos{" "}
							<span className="text-xs text-[var(--text-muted)]">(uno por línea, opcional)</span>
						</label>
						<textarea
							id="findings"
							rows={4}
							value={findingsRaw}
							onChange={(e) => setFindingsRaw(e.target.value)}
							placeholder={"Hallazgo 1\nHallazgo 2\nHallazgo 3"}
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="deviations" className="text-sm font-medium text-[var(--text-primary)]">
							Desviaciones{" "}
							<span className="text-xs text-[var(--text-muted)]">(una por línea, opcional)</span>
						</label>
						<textarea
							id="deviations"
							rows={3}
							value={deviationsRaw}
							onChange={(e) => setDeviationsRaw(e.target.value)}
							placeholder="Desviación identificada..."
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" variant="primary" loading={createMutation.isPending}>
						<Save className="size-4" aria-hidden="true" />
						Crear informe
					</Button>
					<Button asChild type="button" variant="secondary">
						<Link
							href={
								serviceCaseId
									? `/service-cases/${serviceCaseId}`
									: `/execution/${executionSessionId}`
							}
						>
							Cancelar
						</Link>
					</Button>
				</div>
			</form>
		</section>
	);
}
