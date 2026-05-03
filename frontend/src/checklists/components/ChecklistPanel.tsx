"use client";

import type { Checklist, ChecklistItem, ChecklistItemCategory } from "@cermont/shared-types";
import { toSerializedError } from "@cermont/shared-types";
import {
	AlertCircle,
	AlignLeft,
	Camera,
	CheckCircle2,
	CheckSquare,
	ChevronDown,
	Circle,
	ClipboardList,
	Hash,
	Loader2,
	PenTool,
	Plus,
	Sparkles,
	Type,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DraftRestoreBanner, useStateAutosave } from "@/_shared/lib/form";
import { cn } from "@/_shared/lib/utils";
import { ChecklistSignature, useOfflineChecklist } from "..";
import { useChecklist } from "../queries";
import { ChecklistError } from "./ChecklistError";
import { ChecklistSkeleton } from "./ChecklistSkeleton";
import { CompletedChecklistBlock } from "./CompletedChecklistBlock";
import {
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	STATUS_LABELS,
	STATUS_STYLES,
} from "./checklist-constants";
import { SummaryCard } from "./SummaryCard";

interface ChecklistPanelProps {
	orderId: string;
	readOnly?: boolean;
}

export function ChecklistPanel({ orderId, readOnly = false }: ChecklistPanelProps) {
	const { data: checklist, isLoading, error } = useChecklist(orderId);
	const { createChecklistMutation, updateChecklistItemMutation, completeChecklistMutation } =
		useOfflineChecklist();
	const [signature, setSignature] = useState<string | null>(null);
	const [observations, setObservations] = useState(checklist?.observations ?? "");

	const draftId = `checklist:${orderId}`;
	const { restoreDraft, clearDraft, hasDraft } = useStateAutosave({
		draftId,
		value: { observations },
	});

	const checklistKey = checklist?._id ?? "";
	const prevChecklistKeyRef = useRef(checklistKey);
	if (prevChecklistKeyRef.current !== checklistKey) {
		prevChecklistKeyRef.current = checklistKey;
		const restored = restoreDraft({ observations: checklist?.observations ?? "" });
		setSignature(null);
		setObservations(restored.observations);
	}

	if (isLoading) {
		return <ChecklistSkeleton />;
	}

	if (error) {
		return <ChecklistError message={error?.message ?? "No se pudo cargar el checklist."} />;
	}

	const canMutate =
		!!checklist &&
		!readOnly &&
		checklist.status !== "completed" &&
		checklist.status !== "cancelled";
	const totalRequired = checklist?.items.filter((item) => item.required).length ?? 0;
	const completedRequired =
		checklist?.items.filter((item) => item.required && item.completed).length ?? 0;
	const remainingRequired = Math.max(totalRequired - completedRequired, 0);
	const progress = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

	const handleCreateChecklist = async () => {
		try {
			const createdChecklist = await createChecklistMutation.mutateAsync({ orderId });
			if (createdChecklist) {
				toast.success("Checklist generado");
			} else {
				toast.info("Checklist guardado para sincronizar");
			}
		} catch (rawError: unknown) {
			toast.error(toSerializedError(rawError).message);
		}
	};

	const handleUpdateItem = async (
		checklistData: Checklist,
		itemId: string,
		completed: boolean,
		value?: unknown,
		observation?: string,
	) => {
		try {
			await updateChecklistItemMutation.mutateAsync({
				checklistId: checklistData._id,
				orderId,
				itemId,
				completed,
				value,
				observation,
			});
		} catch (rawError: unknown) {
			toast.error(toSerializedError(rawError).message);
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

	const groupedItems = CATEGORY_ORDER.reduce<Record<ChecklistItemCategory, Checklist["items"]>>(
		(groups, category) => {
			groups[category] = checklist.items.filter((item) => item.category === category);
			return groups;
		},
		{ tool: [], equipment: [], ppe: [], procedure: [] },
	);

	return (
		<section className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="space-y-2">
					<span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-sky-300">
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Checklist operativo
					</span>
					<div className="space-y-1">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
							{checklist.templateName ?? "Checklist estándar"}
						</h3>
						<p className="text-sm text-slate-500 dark:text-slate-400">
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
					<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
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
				onUpdate={handleUpdateItem}
			/>

			{checklist.status === "completed" ? (
				<CompletedChecklistBlock checklist={checklist} />
			) : (
				<ChecklistCompletionForm
					canMutate={canMutate}
					isMutating={completeChecklistMutation.isPending}
					remainingRequired={remainingRequired}
					hasSignature={!!signature}
					observations={observations}
					onObservationsChange={setObservations}
					onSignatureChange={setSignature}
					onComplete={handleCompleteChecklist}
				/>
			)}
		</section>
	);

	async function handleCompleteChecklist() {
		if (!checklist) {
			return;
		}
		if (!signature) {
			toast.error("La firma es obligatoria para completar el checklist");
			return;
		}
		if (remainingRequired > 0) {
			toast.error("Aun hay items requeridos pendientes");
			return;
		}

		try {
			const completedChecklist = await completeChecklistMutation.mutateAsync({
				checklistId: checklist._id,
				orderId,
				signature,
				observations,
			});
			setSignature(null);
			clearDraft();
			if (completedChecklist) {
				toast.success("Checklist completado");
			} else {
				toast.info("Checklist guardado para sincronizar");
			}
		} catch (rawError: unknown) {
			toast.error(toSerializedError(rawError).message);
		}
	}
}

function ReadOnlyNotice() {
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200">
			<AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
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
		<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<header className="space-y-2">
				<span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-sky-300">
					<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
					Checklist operativo
				</span>
				<div className="space-y-1">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white">
						Checklist estándar de la orden
					</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						Genera la plantilla base vinculada a esta orden para empezar a marcar items requeridos.
					</p>
				</div>
			</header>

			{readOnly ? <ReadOnlyNotice /> : null}

			<button
				type="button"
				onClick={onCreate}
				disabled={readOnly || isPending}
				className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
			>
				{isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
				) : (
					<Plus className="h-4 w-4" aria-hidden="true" />
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
				<span className="font-medium text-slate-600 dark:text-slate-300">
					Progreso de items requeridos
				</span>
				<span className="font-semibold text-slate-900 dark:text-white">
					{completed}/{total || 0}
				</span>
			</div>
			<div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
	onUpdate,
}: {
	checklist: Checklist;
	groupedItems: Record<ChecklistItemCategory, Checklist["items"]>;
	canMutate: boolean;
	isMutating: boolean;
	onUpdate: (
		checklist: Checklist,
		itemId: string,
		completed: boolean,
		value?: unknown,
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
					<div key={category} className="space-y-3">
						<div className="flex items-center justify-between gap-3">
							<h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
								{CATEGORY_LABELS[category]}
							</h4>
						</div>

						<div className="grid gap-3">
							{items.map((item) => (
								<ChecklistItemRow
									key={item.id}
									item={item}
									canMutate={canMutate}
									isMutating={isMutating}
									onUpdate={(completed, value, obs) =>
										onUpdate(checklist, item.id, completed, value, obs)
									}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}

function ChecklistItemRow({
	item,
	canMutate,
	isMutating,
	onUpdate,
}: {
	item: ChecklistItem;
	canMutate: boolean;
	isMutating: boolean;
	onUpdate: (completed: boolean, value: unknown, obs?: string) => void;
}) {
	const isDisabled = !canMutate || isMutating;

	const renderInput = () => {
		switch (item.type) {
			case "text":
				return (
					<input
						type="text"
						value={typeof item.value === "string" ? item.value : ""}
						onChange={(e) => onUpdate(!!e.target.value, e.target.value)}
						disabled={isDisabled}
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
					/>
				);
			case "number":
				return (
					<input
						type="number"
						value={typeof item.value === "number" ? item.value : ""}
						onChange={(e) => onUpdate(!!e.target.value, e.target.valueAsNumber)}
						disabled={isDisabled}
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
					/>
				);
			case "long_text":
				return (
					<textarea
						value={typeof item.value === "string" ? item.value : ""}
						onChange={(e) => onUpdate(!!e.target.value, e.target.value)}
						disabled={isDisabled}
						rows={3}
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
					/>
				);
			case "select":
				return (
					<select
						value={typeof item.value === "string" ? item.value : ""}
						onChange={(e) => onUpdate(!!e.target.value, e.target.value)}
						disabled={isDisabled}
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
					>
						<option value="">Seleccionar...</option>
						{item.options?.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				);
			default:
				return (
					<button
						type="button"
						onClick={() => onUpdate(!item.completed, !item.completed)}
						disabled={isDisabled}
						className={cn(
							"flex h-6 w-6 items-center justify-center rounded-full border",
							item.completed
								? "bg-emerald-500 border-emerald-500 text-white"
								: "border-slate-300 text-slate-300",
						)}
					>
						{item.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
					</button>
				);
		}
	};

	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-xl border p-4 transition-all",
				item.completed ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white",
			)}
		>
			<div className="flex items-start gap-4">
				<div className="mt-1">{renderInput()}</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-slate-900">{item.description}</span>
						{item.required && (
							<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
								Requerido
							</span>
						)}
					</div>
					<div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
						{getTypeIcon(item.type)}
						<span className="capitalize">{item.type}</span>
					</div>
				</div>
			</div>
			{item.observation && (
				<p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-dashed border-slate-200">
					{item.observation}
				</p>
			)}
		</div>
	);
}

function getTypeIcon(type: string) {
	switch (type) {
		case "text":
			return <Type className="h-3 w-3" />;
		case "long_text":
			return <AlignLeft className="h-3 w-3" />;
		case "number":
			return <Hash className="h-3 w-3" />;
		case "select":
			return <ChevronDown className="h-3 w-3" />;
		case "multi_select":
			return <CheckSquare className="h-3 w-3" />;
		case "photo":
			return <Camera className="h-3 w-3" />;
		case "signature":
			return <PenTool className="h-3 w-3" />;
		default:
			return <Circle className="h-3 w-3" />;
	}
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

			<section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
				<div className="space-y-1">
					<h4 className="text-sm font-semibold text-slate-900 dark:text-white">
						Observaciones de cierre
					</h4>
					<p className="text-xs text-slate-500 dark:text-slate-400">
						Agrega notas finales antes de enviar la firma al backend.
					</p>
				</div>

				<label className="block space-y-2">
					<span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
						Observaciones
					</span>
					<textarea
						value={observations}
						onChange={(event) => onObservationsChange(event.target.value)}
						disabled={!canMutate}
						rows={6}
						className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-950/40 dark:disabled:bg-slate-900"
						placeholder="Describe hallazgos, pendientes o condiciones especiales."
					/>
				</label>

				<button
					type="button"
					onClick={onComplete}
					disabled={!canMutate || isMutating || remainingRequired > 0 || !hasSignature}
					className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
				>
					{isMutating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
					Completar checklist y firmar
				</button>

				<p className="text-xs text-slate-500 dark:text-slate-400">
					La firma solo se envia cuando todos los items requeridos esten completados.
				</p>
			</section>
		</div>
	);
}
