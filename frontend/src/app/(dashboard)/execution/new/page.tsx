"use client";

import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { useCreateExecutionSession } from "@/modules/execution/queries";
import { useServiceCaseContext } from "@/modules/service-cases/hooks/useServiceCaseContext";

export default function NewExecutionSessionPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-brand" />
				</div>
			}
		>
			<NewExecutionSessionForm />
		</Suspense>
	);
}

function NewExecutionSessionForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const prefilledWorkOrderId = searchParams.get("workOrderId") ?? "";

	const {
		workflow,
		isLoading: isContextLoading,
		inheritedFields,
	} = useServiceCaseContext("step_06_execution", serviceCaseId);

	// Derive work order ID: prefer URL param → artifacts → orderId
	const derivedWorkOrderId =
		prefilledWorkOrderId || workflow?.artifacts?.workOrder?.id || workflow?.orderId || "";

	const derivedPlanningId = workflow?.artifacts?.planningPacket?.id ?? "";

	const [workOrderId, setWorkOrderId] = useState(derivedWorkOrderId);
	const [planningPacketId, setPlanningPacketId] = useState(derivedPlanningId);
	const [assignedCrewRaw, setAssignedCrewRaw] = useState("");

	// Update fields once context loads
	useEffect(() => {
		if (derivedWorkOrderId && !workOrderId) {
			setWorkOrderId(derivedWorkOrderId);
		}
	}, [derivedWorkOrderId, workOrderId]);

	useEffect(() => {
		if (derivedPlanningId && !planningPacketId) {
			setPlanningPacketId(derivedPlanningId);
		}
	}, [derivedPlanningId, planningPacketId]);

	const createMutation = useCreateExecutionSession();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!workOrderId.trim()) {
			toast.error("El ID de orden de trabajo es requerido");
			return;
		}

		const assignedCrew = assignedCrewRaw
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		createMutation.mutate(
			{
				workOrderId: workOrderId.trim(),
				planningPacketId: planningPacketId.trim() || undefined,
				serviceCaseId: serviceCaseId || undefined,
				assignedCrew: assignedCrew.length > 0 ? assignedCrew : undefined,
			},
			{
				onSuccess: (response) => {
					toast.success("Sesión de ejecución creada");
					const sessionId = response.data?._id;
					if (sessionId) {
						router.push(`/execution/${sessionId}`);
					} else if (serviceCaseId) {
						router.push(`/service-cases/${serviceCaseId}`);
					} else {
						router.push("/execution");
					}
				},
				onError: (err) => {
					toast.error("Error al crear la sesión", { description: err.message });
				},
			},
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="new-exec-title">
			<header className="space-y-3">
				<Link
					href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/execution"}
					className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver
				</Link>
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">
						Paso 6 / Ejecución en campo
					</p>
					<h1
						id="new-exec-title"
						className="mt-1 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Nueva sesión de ejecución
					</h1>
					{workflow && (
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{workflow.code} — {workflow.clientName}
						</p>
					)}
				</div>
			</header>

			{/* Inherited context banner */}
			{!isContextLoading && inheritedFields.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
					<div className="mb-2 flex items-center gap-2">
						<Info className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
						<p className="text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
							Datos heredados del caso
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
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-1.5">
						<label htmlFor="workOrderId" className="text-sm font-medium text-[var(--text-primary)]">
							ID de Orden de Trabajo <span className="text-red-500">*</span>
						</label>
						<input
							id="workOrderId"
							type="text"
							required
							value={workOrderId}
							onChange={(e) => setWorkOrderId(e.target.value)}
							placeholder="ObjectId de 24 caracteres"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
						{derivedWorkOrderId && (
							<p className="text-[10px] text-[var(--color-brand)]">↑ Heredado del caso</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="planningPacketId"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							ID de Planeación <span className="text-xs text-[var(--text-muted)]">(opcional)</span>
						</label>
						<input
							id="planningPacketId"
							type="text"
							value={planningPacketId}
							onChange={(e) => setPlanningPacketId(e.target.value)}
							placeholder="ObjectId de planeación"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
						{derivedPlanningId && (
							<p className="text-[10px] text-[var(--color-brand)]">↑ Heredado del caso</p>
						)}
					</div>

					<div className="space-y-1.5 md:col-span-2">
						<label
							htmlFor="assignedCrew"
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							Cuadrilla asignada{" "}
							<span className="text-xs text-[var(--text-muted)]">
								(IDs de usuario separados por coma, opcional)
							</span>
						</label>
						<input
							id="assignedCrew"
							type="text"
							value={assignedCrewRaw}
							onChange={(e) => setAssignedCrewRaw(e.target.value)}
							placeholder="userId1, userId2, userId3"
							className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" variant="primary" loading={createMutation.isPending}>
						<Save className="size-4" aria-hidden="true" />
						Crear sesión de ejecución
					</Button>
					<Button asChild type="button" variant="secondary">
						<Link href={serviceCaseId ? `/service-cases/${serviceCaseId}` : "/execution"}>
							Cancelar
						</Link>
					</Button>
				</div>
			</form>
		</section>
	);
}
