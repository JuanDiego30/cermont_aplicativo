"use client";

import { CERMONT_OPERATIONAL_STEPS } from "@cermont/shared-types";
import {
	ArrowDown,
	ArrowUp,
	CheckCircle2,
	FileText,
	LayoutDashboard,
	Plus,
	Save,
	Send,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useReducer } from "react";
import type {
	TemplateDraftFieldItem,
	TemplateDraftItem,
	TemplateDraftSectionItem,
} from "../queries";
import {
	useApproveDraft,
	useConvertToTemplate,
	useSubmitDraftForReview,
	useUpdateDraft,
} from "../queries";

interface TemplateDraftReviewerProps {
	draft: TemplateDraftItem;
}

interface TemplateDraftReviewerState {
	name: string;
	description: string;
	reviewerNotes: string;
	sections: TemplateDraftSectionItem[];
	targetStepCode: string;
}

type TemplateDraftReviewerAction =
	| { type: "SET_NAME"; value: string }
	| { type: "SET_DESCRIPTION"; value: string }
	| { type: "SET_REVIEWER_NOTES"; value: string }
	| {
			type: "SET_SECTIONS";
			value:
				| TemplateDraftSectionItem[]
				| ((curr: TemplateDraftSectionItem[]) => TemplateDraftSectionItem[]);
	  }
	| { type: "SET_TARGET_STEP_CODE"; value: string }
	| {
			type: "UPDATE_SECTION";
			sectionId: string;
			updates: Partial<Pick<TemplateDraftSectionItem, "title" | "description">>;
	  }
	| { type: "RESET"; value: TemplateDraftItem };

const FIELD_KIND_OPTIONS = [
	"text",
	"textarea",
	"number",
	"currency",
	"date",
	"select",
	"multi_select",
	"checkbox",
	"checklist",
	"file",
	"photo",
	"signature",
	"gps",
	"calculated",
];

function createEmptyField(order: number): TemplateDraftFieldItem {
	return {
		fieldId: `field_${crypto.randomUUID()}`,
		label: "Nuevo campo",
		fieldKind: "text",
		required: false,
		order,
		options: [],
		allowOtherOption: false,
		placeholder: "",
		helpText: "",
	};
}

function createReviewerState(draft: TemplateDraftItem): TemplateDraftReviewerState {
	return {
		name: draft.name,
		description: draft.description || "",
		reviewerNotes: draft.reviewerNotes || "",
		sections: draft.sections,
		targetStepCode: draft.targetStepCode || "",
	};
}

function templateDraftReviewerReducer(
	state: TemplateDraftReviewerState,
	action: TemplateDraftReviewerAction,
): TemplateDraftReviewerState {
	switch (action.type) {
		case "SET_NAME":
			return { ...state, name: action.value };
		case "SET_DESCRIPTION":
			return { ...state, description: action.value };
		case "SET_REVIEWER_NOTES":
			return { ...state, reviewerNotes: action.value };
		case "SET_SECTIONS":
			return {
				...state,
				sections: typeof action.value === "function" ? action.value(state.sections) : action.value,
			};
		case "SET_TARGET_STEP_CODE":
			return { ...state, targetStepCode: action.value };
		case "UPDATE_SECTION":
			return {
				...state,
				sections: state.sections.map((section) =>
					section.sectionId === action.sectionId ? { ...section, ...action.updates } : section,
				),
			};
		case "RESET":
			return createReviewerState(action.value);
		default:
			return state;
	}
}

interface TemplateDraftReviewerSidebarProps {
	targetStepCode: string;
	isEditingLocked: boolean;
	reviewerNotes: string;
	sectionCount: number;
	totalFields: number;
	confidence: number;
	onTargetStepCodeChange: (value: string) => void;
	onReviewerNotesChange: (value: string) => void;
}

function TemplateDraftReviewerSidebar({
	targetStepCode,
	isEditingLocked,
	reviewerNotes,
	sectionCount,
	totalFields,
	confidence,
	onTargetStepCodeChange,
	onReviewerNotesChange,
}: TemplateDraftReviewerSidebarProps) {
	const targetStep = CERMONT_OPERATIONAL_STEPS.find((step) => step.code === targetStepCode);

	return (
		<div className="space-y-6">
			<div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card">
				<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
					Configuración Operativa
				</h4>

				<div className="rounded-xl border border-brand/20 bg-brand-blue-bg p-4">
					<label
						htmlFor="draft-target-step"
						className="text-[10px] font-bold uppercase tracking-wider text-brand"
					>
						Paso operativo CERMONT
					</label>
					<select
						id="draft-target-step"
						value={targetStepCode}
						onChange={(event) => onTargetStepCodeChange(event.target.value)}
						disabled={isEditingLocked}
						className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground focus:border-brand focus:ring-1 focus:ring-brand"
					>
						<option value="">Sin asignar</option>
						{CERMONT_OPERATIONAL_STEPS.map((step) => (
							<option key={step.code} value={step.code}>
								{step.stepNumber}. {step.label}
							</option>
						))}
					</select>
					{targetStep && (
						<p className="mt-2 text-[11px] text-muted-foreground">
							Fase {targetStep.phase === "operational" ? "operativa" : "administrativa"} ·{" "}
							{targetStep.requiredDocuments.length} documentos · {targetStep.requiredForms.length}{" "}
							formularios
						</p>
					)}
				</div>

				<div className="space-y-2.5 px-1">
					<div className="flex items-center justify-between border-b border-border-subtle py-2 text-xs">
						<span className="text-muted-foreground">Campos configurados</span>
						<span className="font-bold text-foreground">{totalFields}</span>
					</div>
					<div className="flex items-center justify-between border-b border-border-subtle py-2 text-xs">
						<span className="text-muted-foreground">Secciones</span>
						<span className="font-bold text-foreground">{sectionCount}</span>
					</div>
					<div className="flex items-center justify-between py-2 text-xs">
						<span className="text-muted-foreground">Confianza general</span>
						<span className="font-bold text-foreground">
							{((confidence || 0) * 100).toFixed(0)}%
						</span>
					</div>
				</div>

				<textarea
					value={reviewerNotes}
					onChange={(event) => onReviewerNotesChange(event.target.value)}
					rows={4}
					placeholder="Notas de revisión para la aprobación"
					aria-label="Notas de revisión"
					className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-secondary"
				/>
			</div>

			<div className="rounded-xl border border-border-subtle bg-surface-secondary p-4">
				<div className="flex gap-3">
					<Sparkles className="mt-0.5 size-4 shrink-0 text-amber-500" />
					<p className="text-[10px] leading-relaxed text-secondary">
						<span className="font-bold text-foreground">Regla de publicación:</span> la plantilla
						solo debe aprobarse cuando los campos, opciones y firmas requeridas representen la
						lógica real del paso objetivo.
					</p>
				</div>
			</div>
		</div>
	);
}

interface TemplateDraftReviewerHeaderActionsProps {
	status: TemplateDraftItem["status"];
	pending: {
		save: boolean;
		submitForReview: boolean;
		approve: boolean;
		publish: boolean;
	};
	onSave: () => void;
	onSubmitForReview: () => void;
	onApprove: () => void;
	onPublish: () => void;
}

function TemplateDraftReviewerHeaderActions({
	status,
	pending,
	onSave,
	onSubmitForReview,
	onApprove,
	onPublish,
}: TemplateDraftReviewerHeaderActionsProps) {
	const isEditingLocked = status === "converted_to_template";

	return (
		<div className="flex flex-wrap items-center gap-3">
			{!isEditingLocked && (
				<button
					type="button"
					onClick={onSave}
					className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-brand"
					disabled={pending.save}
				>
					<Save className="size-4" />
					Guardar cambios
				</button>
			)}
			{status === "draft" && (
				<button
					type="button"
					onClick={onSubmitForReview}
					className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand/90"
					disabled={pending.submitForReview}
				>
					<Send className="size-4" />
					Enviar a revisión
				</button>
			)}
			{status === "review_required" || status === "draft" ? (
				<button
					type="button"
					onClick={onApprove}
					className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-success/90"
					disabled={pending.approve}
				>
					<CheckCircle2 className="size-4" />
					Aprobar estructura
				</button>
			) : null}
			{status === "approved" && (
				<button
					type="button"
					onClick={onPublish}
					className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand/90"
					disabled={pending.publish}
				>
					<Send className="size-4" />
					Publicar plantilla
				</button>
			)}
			{status === "converted_to_template" && (
				<div className="flex items-center gap-2 rounded-lg border border-brand bg-brand-blue-bg px-4 py-2 text-sm font-bold text-brand">
					<CheckCircle2 className="size-4" />
					Plantilla publicada
				</div>
			)}
		</div>
	);
}

interface FieldEditorProps {
	field: TemplateDraftFieldItem;
	sectionId: string;
	isEditingLocked: boolean;
	onPatch: (sectionId: string, fieldId: string, patch: Partial<TemplateDraftFieldItem>) => void;
	onMove: (sectionId: string, fieldId: string, direction: "up" | "down") => void;
	onRemove: (sectionId: string, fieldId: string) => void;
	onAddOption: (sectionId: string, fieldId: string) => void;
}

function FieldEditor({
	field,
	sectionId,
	isEditingLocked,
	onPatch,
	onMove,
	onRemove,
	onAddOption,
}: FieldEditorProps) {
	return (
		<div className="rounded-lg border border-border bg-surface-secondary p-4">
			{!isEditingLocked && (
				<div className="mb-3 flex items-center justify-end gap-2">
					<button
						type="button"
						onClick={() => onMove(sectionId, field.fieldId, "up")}
						className="rounded border border-border p-1 text-muted-foreground hover:text-brand"
						aria-label="Subir campo"
					>
						<ArrowUp className="size-3.5" />
					</button>
					<button
						type="button"
						onClick={() => onMove(sectionId, field.fieldId, "down")}
						className="rounded border border-border p-1 text-muted-foreground hover:text-brand"
						aria-label="Bajar campo"
					>
						<ArrowDown className="size-3.5" />
					</button>
					<button
						type="button"
						onClick={() => onRemove(sectionId, field.fieldId)}
						className="rounded border border-border p-1 text-destructive hover:bg-destructive/10"
						aria-label="Eliminar campo"
					>
						<Trash2 className="size-3.5" />
					</button>
				</div>
			)}
			<div className="grid gap-3 md:grid-cols-2">
				<input
					value={field.label}
					onChange={(event) =>
						onPatch(sectionId, field.fieldId, {
							label: event.target.value,
						})
					}
					disabled={isEditingLocked}
					aria-label="Etiqueta del campo"
					className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
				/>
				<select
					value={field.fieldKind}
					onChange={(event) =>
						onPatch(sectionId, field.fieldId, {
							fieldKind: event.target.value,
						})
					}
					disabled={isEditingLocked}
					aria-label="Tipo de campo"
					className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
				>
					{FIELD_KIND_OPTIONS.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<input
					value={field.placeholder || ""}
					onChange={(event) =>
						onPatch(sectionId, field.fieldId, {
							placeholder: event.target.value,
						})
					}
					disabled={isEditingLocked}
					placeholder="Placeholder"
					aria-label="Texto de sugerencia (placeholder)"
					className="rounded-md border border-border bg-card px-3 py-2 text-xs text-secondary"
				/>
				<label className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-secondary">
					<input
						type="checkbox"
						checked={field.required || false}
						onChange={(event) =>
							onPatch(sectionId, field.fieldId, {
								required: event.target.checked,
							})
						}
						disabled={isEditingLocked}
						className="rounded border-border bg-card text-brand focus:ring-brand"
					/>
					Campo obligatorio
				</label>
			</div>

			<textarea
				value={field.helpText || ""}
				onChange={(event) =>
					onPatch(sectionId, field.fieldId, {
						helpText: event.target.value,
					})
				}
				disabled={isEditingLocked}
				rows={2}
				placeholder="Texto de ayuda"
				aria-label="Texto de ayuda del campo"
				className="mt-3 w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-secondary"
			/>

			{["select", "multi_select", "checklist"].includes(field.fieldKind) && (
				<div className="mt-3 space-y-2">
					<div className="flex items-center justify-between">
						<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
							Opciones
						</p>
						<button
							type="button"
							onClick={() => onAddOption(sectionId, field.fieldId)}
							disabled={isEditingLocked}
							className="text-[10px] font-bold text-brand"
						>
							Agregar opción
						</button>
					</div>
					<div className="grid gap-2 md:grid-cols-2">
						{(field.options || []).map((option) => (
							<input
								key={`${field.fieldId}-${option}`}
								value={option}
								onChange={(event) => {
									const currentOptions = [...(field.options || [])];
									const index = currentOptions.indexOf(option);
									currentOptions[index] = event.target.value;
									onPatch(sectionId, field.fieldId, {
										options: currentOptions,
									});
								}}
								disabled={isEditingLocked}
								aria-label={`Opción ${option}`}
								className="rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground"
							/>
						))}
					</div>
					<label className="flex items-center gap-2 text-xs text-secondary">
						<input
							type="checkbox"
							checked={field.allowOtherOption || false}
							onChange={(event) =>
								onPatch(sectionId, field.fieldId, {
									allowOtherOption: event.target.checked,
								})
							}
							disabled={isEditingLocked}
							className="rounded border-border bg-card text-brand focus:ring-brand"
						/>
						Permitir “otro, ¿cuál?”
					</label>
				</div>
			)}
		</div>
	);
}

export function TemplateDraftReviewer({ draft }: TemplateDraftReviewerProps) {
	const approve = useApproveDraft();
	const convert = useConvertToTemplate();
	const updateDraft = useUpdateDraft(draft._id);
	const submitForReview = useSubmitDraftForReview(draft._id);

	const [state, dispatch] = useReducer(templateDraftReviewerReducer, draft, createReviewerState);

	const { name, description, reviewerNotes, sections, targetStepCode } = state;

	const setSections = (
		value:
			| TemplateDraftSectionItem[]
			| ((curr: TemplateDraftSectionItem[]) => TemplateDraftSectionItem[]),
	) => dispatch({ type: "SET_SECTIONS", value });

	const isConverted = draft.status === "converted_to_template";
	const isEditingLocked = isConverted;
	const totalFields = sections.reduce((count, section) => count + section.fields.length, 0);

	function patchField(
		sectionId: string,
		fieldId: string,
		patch: Partial<TemplateDraftFieldItem>,
	): void {
		setSections((current) =>
			current.map((section) =>
				section.sectionId === sectionId
					? {
							...section,
							fields: section.fields.map((field) =>
								field.fieldId === fieldId ? { ...field, ...patch } : field,
							),
						}
					: section,
			),
		);
	}

	function addField(sectionId: string): void {
		setSections((current) =>
			current.map((section) =>
				section.sectionId === sectionId
					? {
							...section,
							fields: [...section.fields, createEmptyField(section.fields.length)],
						}
					: section,
			),
		);
	}

	function addOption(sectionId: string, fieldId: string): void {
		const targetSection = sections.find((section) => section.sectionId === sectionId);
		const targetField = targetSection?.fields.find((field) => field.fieldId === fieldId);
		const currentOptions = targetField?.options || [];

		patchField(sectionId, fieldId, {
			options: [...currentOptions, `opcion_${currentOptions.length + 1}`],
		});
	}

	function removeField(sectionId: string, fieldId: string): void {
		setSections((current) =>
			current.map((section) =>
				section.sectionId === sectionId
					? {
							...section,
							fields: section.fields.filter((field) => field.fieldId !== fieldId),
						}
					: section,
			),
		);
	}

	function moveField(sectionId: string, fieldId: string, direction: "up" | "down"): void {
		const calculateTargetIndex = (index: number, dir: "up" | "down") => {
			return dir === "up" ? index - 1 : index + 1;
		};

		const isValidTargetIndex = (targetIndex: number, length: number) => {
			return targetIndex >= 0 && targetIndex < length;
		};

		const reorderFields = (
			fields: TemplateDraftFieldItem[],
			fromIndex: number,
			toIndex: number,
		) => {
			const reordered = [...fields];
			const [moved] = reordered.splice(fromIndex, 1);
			reordered.splice(toIndex, 0, moved);
			return reordered.map((field, order) => ({ ...field, order }));
		};

		setSections((current) =>
			current.map((section) => {
				if (section.sectionId !== sectionId) {
					return section;
				}

				const index = section.fields.findIndex((field) => field.fieldId === fieldId);
				if (index === -1) {
					return section;
				}

				const targetIndex = calculateTargetIndex(index, direction);
				if (!isValidTargetIndex(targetIndex, section.fields.length)) {
					return section;
				}

				return {
					...section,
					fields: reorderFields(section.fields, index, targetIndex),
				};
			}),
		);
	}

	function addSection(): void {
		setSections((current) => [
			...current,
			{
				sectionId: `section_${crypto.randomUUID()}`,
				title: "Nueva sección",
				description: "Agrupe aquí nuevos campos del formulario.",
				order: current.length,
				fields: [],
				tables: [],
			},
		]);
	}

	async function persistDraft(): Promise<void> {
		await updateDraft.mutateAsync({
			name,
			description,
			sections,
			targetStepCode: targetStepCode || undefined,
		});
	}

	async function handleApprove(): Promise<void> {
		await persistDraft();
		await approve.mutateAsync({ id: draft._id, reviewerNotes });
	}

	async function handleSubmitForReview(): Promise<void> {
		await persistDraft();
		await submitForReview.mutateAsync();
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="rounded-xl border border-border bg-surface-secondary p-3">
						<FileText className="size-6 text-brand" />
					</div>
					<div className="space-y-2">
						<input
							value={name}
							onChange={(event) => dispatch({ type: "SET_NAME", value: event.target.value })}
							disabled={isEditingLocked}
							aria-label="Nombre de la plantilla"
							className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xl font-bold text-foreground"
						/>
						<textarea
							value={description}
							onChange={(event) => dispatch({ type: "SET_DESCRIPTION", value: event.target.value })}
							disabled={isEditingLocked}
							rows={2}
							aria-label="Resolución/Descripción de la plantilla"
							className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-secondary"
						/>
					</div>
				</div>

				<TemplateDraftReviewerHeaderActions
					status={draft.status}
					pending={{
						save: updateDraft.isPending,
						submitForReview: submitForReview.isPending,
						approve: approve.isPending,
						publish: convert.isPending,
					}}
					onSave={() => void persistDraft()}
					onSubmitForReview={() => void handleSubmitForReview()}
					onApprove={() => void handleApprove()}
					onPublish={() => convert.mutate(draft._id)}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					{sections.length === 0 ? (
						<div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
							<LayoutDashboard className="mx-auto mb-4 size-12 text-muted-foreground opacity-20" />
							<p className="text-sm text-secondary">No se detectaron secciones.</p>
						</div>
					) : (
						sections.map((section) => (
							<section
								key={section.sectionId}
								className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm"
							>
								<div className="mb-5 border-b border-border-subtle pb-3">
									<input
										value={section.title}
										onChange={(event) =>
											dispatch({
												type: "UPDATE_SECTION",
												sectionId: section.sectionId,
												updates: { title: event.target.value },
											})
										}
										disabled={isEditingLocked}
										aria-label="Título de la sección"
										className="w-full rounded-md border border-border bg-card px-3 py-2 text-md font-bold text-foreground"
									/>
									<textarea
										value={section.description || ""}
										onChange={(event) =>
											dispatch({
												type: "UPDATE_SECTION",
												sectionId: section.sectionId,
												updates: { description: event.target.value },
											})
										}
										disabled={isEditingLocked}
										rows={2}
										aria-label="Descripción de la sección"
										className="mt-2 w-full rounded-md border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground"
									/>
								</div>

								<div className="grid gap-3">
									{section.fields.map((field) => (
										<FieldEditor
											key={field.fieldId}
											field={field}
											sectionId={section.sectionId}
											isEditingLocked={isEditingLocked}
											onPatch={patchField}
											onMove={moveField}
											onRemove={removeField}
											onAddOption={addOption}
										/>
									))}
								</div>

								{!isEditingLocked && (
									<button
										type="button"
										onClick={() => addField(section.sectionId)}
										className="mt-4 inline-flex items-center gap-2 rounded-md border border-dashed border-brand px-3 py-2 text-xs font-bold text-brand"
									>
										<Plus className="size-3.5" />
										Agregar campo
									</button>
								)}
							</section>
						))
					)}

					{!isEditingLocked && (
						<button
							type="button"
							onClick={addSection}
							className="inline-flex items-center gap-2 rounded-lg border border-dashed border-brand bg-brand-blue-bg px-4 py-3 text-sm font-bold text-brand"
						>
							<Plus className="size-4" />
							Agregar sección
						</button>
					)}
				</div>

				<TemplateDraftReviewerSidebar
					targetStepCode={targetStepCode}
					isEditingLocked={isEditingLocked}
					reviewerNotes={reviewerNotes}
					sectionCount={sections.length}
					totalFields={totalFields}
					confidence={draft.confidence || 0}
					onTargetStepCodeChange={(value) => dispatch({ type: "SET_TARGET_STEP_CODE", value })}
					onReviewerNotesChange={(value) => dispatch({ type: "SET_REVIEWER_NOTES", value })}
				/>
			</div>
		</div>
	);
}
