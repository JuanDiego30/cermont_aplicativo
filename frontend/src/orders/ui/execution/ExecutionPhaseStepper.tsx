"use client";

import type { Checklist, Evidence, ExecutionPhaseType, Order } from "@cermont/shared-types";
import { AlertTriangle, CheckCircle2, Loader2, Lock, Play, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/_shared/lib/utils";
import { ChecklistPanel } from "@/checklists";
import { useChecklist } from "@/checklists/queries";
import { Button } from "@/core";
import { useEvidences } from "@/evidences/queries";
import { EvidenceUploader } from "@/evidences/ui/EvidenceUploader";
import { useOfflineExecution } from "@/orders/hooks/useOfflineExecution";
import { useOrder } from "@/orders/queries";

interface ExecutionPhaseStepperProps {
	orderId: string;
}

const PHASES: { id: ExecutionPhaseType; label: string; description: string }[] = [
	{ id: "PRE_START", label: "Pre-Inicio", description: "Seguridad y Preparación" },
	{ id: "IN_EXECUTION", label: "Ejecución", description: "Trabajo en Campo" },
	{ id: "CLOSURE", label: "Cierre", description: "Verificación y Entrega" },
];

export function ExecutionPhaseStepper({ orderId }: ExecutionPhaseStepperProps) {
	const { data: order, isLoading: orderLoading } = useOrder(orderId);
	const { mutateAsync: transitionPhase, isPending: isTransitioning } = useOfflineExecution(orderId);

	const currentPhase = order?.executionPhase?.current || null;

	const handleTransition = async (target: ExecutionPhaseType) => {
		try {
			const updatedOrder = await transitionPhase({ targetPhase: target });
			if (updatedOrder) {
				toast.success(`Fase ${target} iniciada correctamente`);
			} else {
				toast.info("Transición encolada para sincronización offline");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al cambiar de fase");
		}
	};

	if (orderLoading) {
		return (
			<div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (!order) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Stepper Header */}
			<nav aria-label="Progreso de ejecución" className="px-4 py-2">
				<ol className="flex items-center justify-between space-x-4">
					{PHASES.map((phase, idx) => {
						const isCompleted = isPhaseCompleted(order, phase.id);
						const isActive = currentPhase === phase.id;
						const isLocked = isPhaseLocked(order, phase.id);

						return (
							<li key={phase.id} className="relative flex flex-1 flex-col items-center">
								{idx > 0 && (
									<div
										className={cn(
											"absolute right-[50%] top-4 -z-10 h-0.5 w-full",
											isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800",
										)}
									/>
								)}
								<div
									className={cn(
										"flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
										isCompleted
											? "border-emerald-500 bg-emerald-500 text-white"
											: isActive
												? "border-blue-600 bg-white text-blue-600 dark:bg-slate-950"
												: "border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-900",
									)}
								>
									{isCompleted ? (
										<CheckCircle2 className="h-5 w-5" />
									) : isLocked ? (
										<Lock className="h-4 w-4" />
									) : (
										<span>{idx + 1}</span>
									)}
								</div>
								<span
									className={cn(
										"mt-2 text-[10px] font-bold uppercase tracking-wider",
										isActive ? "text-blue-600" : "text-slate-500",
									)}
								>
									{phase.label}
								</span>
							</li>
						);
					})}
				</ol>
			</nav>

			{/* Active Phase Content */}
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
				{currentPhase === null && (
					<div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
						<Play className="h-12 w-12 text-blue-500 opacity-20" />
						<div>
							<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
								Iniciar Ejecución
							</h3>
							<p className="mx-auto max-w-xs text-sm text-slate-500">
								Comience el flujo de trabajo operativo para registrar actividades, seguridad y
								cumplimiento.
							</p>
						</div>
						<Button onClick={() => handleTransition("PRE_START")} loading={isTransitioning}>
							Comenzar Fase Pre-Inicio
						</Button>
					</div>
				)}

				{currentPhase === "PRE_START" && (
					<PhaseOneContent
						order={order}
						onTransition={() => handleTransition("IN_EXECUTION")}
						isTransitioning={isTransitioning}
					/>
				)}

				{currentPhase === "IN_EXECUTION" && (
					<PhaseTwoContent
						order={order}
						onTransition={() => handleTransition("CLOSURE")}
						isTransitioning={isTransitioning}
					/>
				)}

				{currentPhase === "CLOSURE" && <PhaseThreeContent order={order} />}
			</div>
		</div>
	);
}

// ── Components for each phase ────────────────────────────────

interface PhaseContentProps {
	order: Order;
	onTransition: () => void;
	isTransitioning: boolean;
}

function PhaseOneContent({ order, onTransition, isTransitioning }: PhaseContentProps) {
	const { data: checklist } = useChecklist(order._id);
	const { data: evidences } = useEvidences(order._id);
	const hasBeforePhoto = evidences?.some((e: Evidence) => e.type === "before");
	const safetyPending =
		checklist?.items.filter(
			(i: Checklist["items"][number]) =>
				(i.category === "ppe" || i.category === "procedure") && i.required && !i.completed,
		).length || 0;

	const canAdvance = hasBeforePhoto && safetyPending === 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
				<ShieldCheck className="h-6 w-6 text-blue-600" />
				<div>
					<h3 className="font-bold text-slate-900 dark:text-white">FASE 1: PRE-INICIO</h3>
					<p className="text-xs text-slate-500">
						Complete los requisitos de seguridad antes de iniciar el trabajo.
					</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-4">
					<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
						1. Seguridad y PPE
					</h4>
					<ChecklistPanel orderId={order._id} />
				</div>

				<div className="space-y-4">
					<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
						2. Evidencia de Inicio
					</h4>
					<div className="rounded-xl border border-dashed border-slate-200 p-4 dark:border-slate-800">
						<p className="mb-4 text-xs text-slate-500">
							Tome al menos una fotografía del estado inicial del activo o área de trabajo.
						</p>
						<EvidenceUploader orderId={order._id} />
						{hasBeforePhoto && (
							<div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
								<CheckCircle2 className="h-4 w-4" />
								Foto 'Antes' registrada correctamente.
							</div>
						)}
					</div>
				</div>
			</div>

			{!canAdvance && (
				<div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
					<AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
					<p className="text-xs">
						Para avanzar necesita: Marcar todos los items de seguridad en el checklist y subir al
						menos una foto tipo 'Antes'.
					</p>
				</div>
			)}

			<div className="flex justify-end pt-4">
				<Button
					variant="primary"
					disabled={!canAdvance}
					loading={isTransitioning}
					onClick={onTransition}
				>
					Iniciar Ejecución en Campo
				</Button>
			</div>
		</div>
	);
}

function PhaseTwoContent({ order, onTransition, isTransitioning }: PhaseContentProps) {
	const { data: checklist } = useChecklist(order._id);
	const pendingSteps =
		checklist?.items.filter(
			(i: Checklist["items"][number]) => i.category === "procedure" && i.required && !i.completed,
		).length || 0;

	const canAdvance = pendingSteps === 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
				<Play className="h-6 w-6 text-blue-600" />
				<div>
					<h3 className="font-bold text-slate-900 dark:text-white">FASE 2: EN EJECUCIÓN</h3>
					<p className="text-xs text-slate-500">
						Registre los pasos del procedimiento y el progreso del trabajo.
					</p>
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
					Procedimiento Técnico
				</h4>
				<ChecklistPanel orderId={order._id} />
			</div>

			{!canAdvance && (
				<div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
					<AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
					<p className="text-xs">
						Complete todos los pasos obligatorios del procedimiento para poder proceder al cierre.
					</p>
				</div>
			)}

			<div className="flex justify-end pt-4">
				<Button
					variant="primary"
					disabled={!canAdvance}
					loading={isTransitioning}
					onClick={onTransition}
				>
					Pasar a Cierre de Orden
				</Button>
			</div>
		</div>
	);
}

function PhaseThreeContent({ order }: { order: Order }) {
	const { data: evidences } = useEvidences(order._id);
	const hasAfterPhoto = evidences?.some((e: Evidence) => e.type === "after");
	const isCompleted = !!order.executionPhase?.closureCompletedAt;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
				<Save className="h-6 w-6 text-emerald-600" />
				<div>
					<h3 className="font-bold text-slate-900 dark:text-white">FASE 3: CIERRE EN CAMPO</h3>
					<p className="text-xs text-slate-500">Verifique el resultado final y firme la entrega.</p>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-4">
					<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
						1. Evidencia de Finalización
					</h4>
					<div className="rounded-xl border border-dashed border-slate-200 p-4 dark:border-slate-800">
						<EvidenceUploader orderId={order._id} />
						{hasAfterPhoto && (
							<div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
								<CheckCircle2 className="h-4 w-4" />
								Foto 'Después' registrada correctamente.
							</div>
						)}
					</div>
				</div>

				<div className="space-y-4">
					<h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
						2. Firma y Observaciones
					</h4>
					<ChecklistPanel orderId={order._id} />
				</div>
			</div>

			{isCompleted && (
				<div className="rounded-xl bg-emerald-50 p-6 text-center border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
					<CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
					<h3 className="mt-2 text-lg font-bold text-emerald-900 dark:text-emerald-300">
						¡Trabajo de Campo Cerrado!
					</h3>
					<p className="text-sm text-emerald-700 dark:text-emerald-400">
						Toda la información operativa ha sido capturada y firmada.
					</p>
				</div>
			)}
		</div>
	);
}

// ── Helpers ──────────────────────────────────────────────────

function isPhaseCompleted(order: Order, phase: ExecutionPhaseType): boolean {
	const ep = order.executionPhase;
	if (!ep) {
		return false;
	}

	if (phase === "PRE_START") {
		return !!ep.preStartCompletedAt;
	}
	if (phase === "IN_EXECUTION") {
		return !!ep.inExecutionCompletedAt;
	}
	if (phase === "CLOSURE") {
		return !!ep.closureCompletedAt;
	}
	return false;
}

function isPhaseLocked(order: Order, phase: ExecutionPhaseType): boolean {
	const current = order.executionPhase?.current || null;

	if (phase === "PRE_START") {
		return false;
	}
	if (phase === "IN_EXECUTION") {
		return current !== "IN_EXECUTION" && !order.executionPhase?.inExecutionCompletedAt;
	}
	if (phase === "CLOSURE") {
		return current !== "CLOSURE" && !order.executionPhase?.closureCompletedAt;
	}
	return true;
}
