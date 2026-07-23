"use client";

import type { Checklist, ChecklistItemCategory } from "@cermont/shared-types";
import {
	AlertCircle,
	CheckCircle2,
	Circle,
	ClipboardList,
	Loader2,
	Plus,
	Sparkles,
} from "lucide-react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DraftRestoreBanner } from "@/lib/form";
import { useStateAutosave } from "@/lib/form/use-state-autosave";
import { cn } from "@/lib/utils";
import { useOfflineChecklist } from "../hooks/useOfflineChecklist";
import { useChecklist } from "../queries";
import { ChecklistError } from "./ChecklistError";
import { ChecklistSignature } from "./ChecklistSignature";
import { ChecklistSkeleton } from "./ChecklistSkeleton";
import { CompletedChecklistBlock } from "./CompletedChecklistBlock";
import {
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	STATUS_LABELS,
	STATUS_STYLES,
} from "./checklist-constants";
import { SummaryCard } from "./SummaryCard";

function getErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = (error as Record<string, unknown>).message;
		if (typeof message === "string") {
			return message;
		}
	}

	return fallback;
}

interface ChecklistPanelProps {
	orderId: string;
	readOnly?: boolean;
}

interface ChecklistProgress {
	totalRequired: number;
	completedRequired: number;
	remainingRequired: number;
	progress: number;
}

interface ChecklistDraftSyncInput {
	checklist?: Checklist;
	checklistKey: string;
	previousChecklistKeyRef: MutableRefObject<string>;
	restoreDraft: (fallback: { observations: string }) => { observations: string };
	setObservations: Dispatch<SetStateAction<string>>;
	setSignature: Dispatch<SetStateAction<string>>;
}

function isChecklistMutable(checklist: Checklist, readOnly: boolean): boolean {
	return !readOnly && checklist.status !== "completed" && checklist.status !== "cancelled";
}

function getChecklistProgress(checklist: Checklist): ChecklistProgress {
	const totalRequired = checklist.items.filter((item) => item.required).length;
	const completedRequired = checklist.items.filter(
		(item) => item.required && item.completed,
	).length;
	const remainingRequired = Math.max(totalRequired - completedRequired, 0);
	const progress = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

	return { completedRequired, progress, remainingRequired, totalRequired };
}

function groupChecklistItems(
	checklist: Checklist,
): Record<ChecklistItemCategory, Checklist["items"]> {
	return CATEGORY_ORDER.reduce<Record<ChecklistItemCategory, Checklist["items"]>>(
		(groups, category) => {
			groups[category] = checklist.items.filter((item) => item.category === category);
			return groups;
		},
		{ tool: [], equipment: [], ppe: [], procedure: [] },
	);
}

function syncChecklistDraftState({
	checklist,
	checklistKey,
	previousChecklistKeyRef,
	restoreDraft,
	setObservations,
	setSignature,
}: ChecklistDraftSyncInput) {
	if (previousChecklistKeyRef.current === checklistKey) {
		return;
	}

	previousChecklistKeyRef.current = checklistKey;
	const restored = restoreDraft({ observations: checklist?.observations ?? "" });
	setSignature("");
	setObservations(restored.observations);
}

export function ChecklistPanel({ orderId, readOnly = false }: ChecklistPanelProps) {
	const { data: checklist, isLoading, error } = useChecklist(orderId);
	const { createChecklistMutation, updateChecklistItemMutation, completeChecklistMutation } =
		useOfflineChecklist();
	const [signature, setSignature] = useState("");
	const [observations, setObservations] = useState(checklist?.observations ?? "");

	const draftId = `checklist:${orderId}`;
	const autosaveValue = useMemo(() => ({ observations }), [observations]);
	const { restoreDraft, clearDraft, hasDraft } = useStateAutosave({
		draftId,
		value: autosaveValue,
	});

	const checklistKey = checklist?._id ?? "";
	const prevChecklistKeyRef = useRef(checklistKey);
	syncChecklistDraftState({
		checklist: checklist ?? undefined,
		checklistKey,
		previousChecklistKeyRef: prevChecklistKeyRef,
		restoreDraft,
		setObservations,
		setSignature,
	});

	if (isLoading) {
		return <ChecklistSkeleton />;
	}

	if (error) {
		return <ChecklistError message={error?.message ?? "No se pudo cargar el checklist."} />;
	}

	const handleCreateChecklist = async () => {
		try {
			const result = await createChecklistMutation.mutateAsync({ orderId });
			toast.success(result ? "Checklist generado" : "Guardado para sincronizar");
		} catch (e) {
			toast.error(getErrorMessage(e, "Error al generar checklist"));
		}
	};

	const handleToggleItem = async (
		cd: Checklist,
		itemId: string,
		completed: boolean,
		observation?: string,
	) => {
		try {
			await updateChecklistItemMutation.mutateAsync({
				checklistId: cd._id,
				orderId,
				itemId,
				result: completed ? "passed" : "pending",
				observation,
			});
		} catch (e) {
			toast.error(getErrorMessage(e, "Error al actualizar item"));
		}
	};

	const handleCompleteChecklist = async () => {
		if (!checklist || !signature) {
			toast.error("Firma requerida");
			return;
		}
		if (checklist.status === "completed" || checklist.status === "cancelled") {
			return;
		}
		if (remainingRequired > 0) {
			toast.error("Items requeridos pendientes");
			return;
		}
		try {
			const completed = await completeChecklistMutation.mutateAsync({
				checklistId: checklist._id,
				orderId,
				signature,
				observations,
			});
			setSignature("");
			clearDraft();
			toast.success(completed ? "Checklist completado" : "Guardado para sincronizar");
		} catch (e) {
			toast.error(getErrorMessage(e, "Error al completar"));
		}
	};

	if (!checklist) {
		return (
			<EmptyChecklistState
				readOnly={readOnly}
				isPending={createChecklistMutation.isPending}
				onCreate={handleCreateChecklist}
			/>
		);
	}

	const canMutate = isChecklistMutable(checklist, readOnly);
	const { completedRequired, progress, remainingRequired, totalRequired } =
		getChecklistProgress(checklist);
	const groupedItems = groupChecklistItems(checklist);

	return (
		<section className="space-y-6 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)] sm:p-6">
			<header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="space-y-2">
					<span className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
						<ClipboardList className="size-3.5" aria-hidden="true" />
						Checklist operativo
					</span>
					<div className="space-y-1">
						<h3 className="text-lg font-semibold text-[var(--text-primary)]">
							{checklist.templateName ?? "Checklist estándar"}
						</h3>
						<p className="text-sm text-[var(--text-secondary)]">
							Control de herramientas, equipos, EPP y procedimiento asociado a la orden.
						</p>
					</div>
				</div>

				<div
					data-testid="checklist-status-badge"
					className={cn(
						"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
						STATUS_STYLES[checklist.status],
					)}
				>
					<Sparkles className="size-3.5" aria-hidden="true" />
					{STATUS_LABELS[checklist.status]}
				</div>
			</header>

			{readOnly ? <ReadOnlyNotice /> : null}

			{hasDraft ? (
				<DraftRestoreBanner
					onRestore={() => {
						const restored = restoreDraft({ observations });
						setObservations(restored.observations);
					}}
					onDiscard={clearDraft}
				/>
			) : null}

			<dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<SummaryCard label="Items totales" value={String(checklist.items.length)} />
				<SummaryCard label="Requeridos" value={String(totalRequired)} />
				<SummaryCard label="Completados" value={String(completedRequired)} />
				<SummaryCard
					label="Pendientes"
					value={String(remainingRequired)}
					tone={remainingRequired > 0 ? "warning" : "success"}
				/>
			</dl>

			<ProgressBar completed={completedRequired} total={totalRequired} progress={progress} />

			<ChecklistCategoryList
				checklist={checklist}
				groupedItems={groupedItems}
				canMutate={canMutate}
				isMutating={updateChecklistItemMutation.isPending}
				onToggle={handleToggleItem}
			/>

			{checklist.status === "completed" ? (
				<CompletedChecklistBlock checklist={checklist} />
			) : (
				<ChecklistCompletionForm
					canMutate={canMutate}
					isMutating={completeChecklistMutation.isPending}
					remainingRequired={remainingRequired}
					hasSignature={signature.length > 0}
					observations={observations}
					onObservationsChange={setObservations}
					onSignatureChange={(s) => {
						if (s !== null) {
							setSignature(s);
						}
					}}
					onComplete={handleCompleteChecklist}
				/>
			)}
		</section>
	);
}

function ReadOnlyNotice() {
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-warning-bg px-4 py-3 text-brand-warn dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-brand-warn">
			<AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
			<p className="text-sm">
				La orden esta cerrada o bloqueada. El checklist queda en modo de solo lectura.
			</p>
		</div>
	);
}

function EmptyChecklistState({
	readOnly,
	isPending,
	onCreate,
}: {
	readOnly: boolean;
	isPending: boolean;
	onCreate: () => void;
}) {
	return (
		<section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)] sm:p-6">
			<header className="space-y-2">
				<span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-brand-green">
					<ClipboardList className="size-3.5" aria-hidden="true" />
					Checklist operativo
				</span>
				<div className="space-y-1">
					<h3 className="text-lg font-semibold text-ink dark:text-white">
						Checklist estándar de la orden
					</h3>
					<p className="text-sm text-steel dark:text-stone">
						Genera la plantilla base vinculada a esta orden para empezar a marcar items requeridos.
					</p>
				</div>
			</header>

			{readOnly ? <ReadOnlyNotice /> : null}

			<button
				type="button"
				onClick={onCreate}
				disabled={readOnly || isPending}
				className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-canvas dark:text-ink dark:hover:bg-zinc-200"
			>
				{isPending ? (
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
				) : (
					<Plus className="size-4" aria-hidden="true" />
				)}
				Generar checklist
			</button>
		</section>
	);
}

function ProgressBar({
	completed,
	total,
	progress,
}: {
	completed: number;
	total: number;
	progress: number;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-3 text-sm">
				<span className="font-medium text-steel dark:text-muted-text">
					Progreso de items requeridos
				</span>
				<span className="font-semibold text-ink dark:text-white">
					{completed}/{total || 0}
				</span>
			</div>
			<div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-surface">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-300",
						progress === 100 ? "bg-emerald-500" : "bg-sky-500",
					)}
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}

function ChecklistCategoryList({
	checklist,
	groupedItems,
	canMutate,
	isMutating,
	onToggle,
}: {
	checklist: Checklist;
	groupedItems: Record<ChecklistItemCategory, Checklist["items"]>;
	canMutate: boolean;
	isMutating: boolean;
	onToggle: (
		checklist: Checklist,
		itemId: string,
		completed: boolean,
		observation?: string,
	) => void;
}) {
	return (
		<div className="space-y-4">
			{CATEGORY_ORDER.map((category) => {
				const items = groupedItems[category];
				if (items.length === 0) {
					return null;
				}

				return (
					<div key={category} className="space-y-2">
						<div className="flex items-center justify-between gap-3">
							<h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-steel dark:text-stone">
								{CATEGORY_LABELS[category]}
							</h4>
							<span className="text-xs text-stone dark:text-steel">{items.length} items</span>
						</div>

						<div className="grid gap-2">
							{items.map((item) => (
								<ChecklistItemButton
									key={item.id}
									item={item}
									category={category}
									checklist={checklist}
									disabled={!canMutate || isMutating}
									onToggle={onToggle}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}

function ChecklistItemButton({
	item,
	category,
	checklist,
	disabled,
	onToggle,
}: {
	item: Checklist["items"][number];
	category: ChecklistItemCategory;
	checklist: Checklist;
	disabled: boolean;
	onToggle: (
		checklist: Checklist,
		itemId: string,
		completed: boolean,
		observation?: string,
	) => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={item.completed}
			disabled={disabled}
			onClick={() => onToggle(checklist, item.id, !item.completed, item.observation)}
			className={cn(
				"flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
				item.completed
					? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-900/10"
					: "border-hairline bg-canvas hover:border-sky-300 hover:bg-sky-50/40 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-sky-900/40 dark:hover:bg-sky-900/10",
				disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
			)}
		>
			<span
				className={cn(
					"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
					item.completed
						? "border-emerald-500 bg-emerald-500 text-white"
						: "border-hairline bg-canvas text-stone dark:border-zinc-600 dark:bg-canvas",
				)}
				aria-hidden="true"
			>
				{item.completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
			</span>

			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					<p
						className={cn(
							"text-sm font-medium",
							item.completed
								? "text-brand-annotate dark:text-brand-annotate"
								: "text-ink dark:text-white",
						)}
					>
						{item.description}
					</p>
					<span
						className={cn(
							"rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em]",
							item.required
								? "border-amber-200 bg-warning-bg text-brand-warn dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-brand-warn"
								: "border-hairline bg-surface text-steel dark:border-zinc-700 dark:bg-canvas dark:text-stone",
						)}
					>
						{item.required ? "Requerido" : "Opcional"}
					</span>
				</div>

				<p className="text-xs text-steel dark:text-stone">{CATEGORY_LABELS[category]}</p>

				{item.observation ? (
					<p className="rounded-xl border border-dashed border-hairline bg-surface px-3 py-2 text-xs text-steel dark:border-zinc-800 dark:bg-canvas dark:text-muted-text">
						{item.observation}
					</p>
				) : null}
			</div>
		</button>
	);
}

function ChecklistCompletionForm({
	canMutate,
	isMutating,
	remainingRequired,
	hasSignature,
	observations,
	onObservationsChange,
	onSignatureChange,
	onComplete,
}: {
	canMutate: boolean;
	isMutating: boolean;
	remainingRequired: number;
	hasSignature: boolean;
	observations: string;
	onObservationsChange: (value: string) => void;
	onSignatureChange: (signature: string | null) => void;
	onComplete: () => void;
}) {
	return (
		<div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
			<ChecklistSignature onChange={onSignatureChange} disabled={!canMutate} />

			<section className="space-y-3 rounded-2xl border border-hairline bg-surface p-4 dark:border-zinc-800 dark:bg-canvas/50">
				<div className="space-y-1">
					<h4 className="text-sm font-semibold text-ink dark:text-white">
						Observaciones de cierre
					</h4>
					<p className="text-xs text-steel dark:text-stone">
						Agrega notas finales antes de enviar la firma al backend.
					</p>
				</div>

				<label className="block space-y-2">
					<span className="text-xs font-semibold uppercase tracking-[0.18em] text-steel dark:text-stone">
						Observaciones
					</span>
					<textarea
						value={observations}
						onChange={(event) => onObservationsChange(event.target.value)}
						disabled={!canMutate}
						rows={6}
						className="w-full rounded-2xl border border-hairline bg-canvas px-4 py-3 text-sm text-ink outline-none transition placeholder:text-stone focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-steel dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-950/40 dark:disabled:bg-zinc-900"
						placeholder="Describe hallazgos, pendientes o condiciones especiales."
					/>
				</label>

				<button
					type="button"
					onClick={onComplete}
					disabled={!canMutate || isMutating || remainingRequired > 0 || !hasSignature}
					className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
				>
					{isMutating ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
					Completar checklist y firmar
				</button>

				<p className="text-xs text-steel dark:text-stone">
					La firma solo se envia cuando todos los items requeridos esten completados.
				</p>
			</section>
		</div>
	);
}
