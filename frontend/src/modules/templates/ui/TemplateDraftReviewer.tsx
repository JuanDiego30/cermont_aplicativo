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
import { useState } from "react";
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

export function TemplateDraftReviewer({ draft }: TemplateDraftReviewerProps) {
	const approve = useApproveDraft();
	const convert = useConvertToTemplate();
	const updateDraft = useUpdateDraft(draft._id);
	const submitForReview = useSubmitDraftForReview(draft._id);

	const [name, setName] = useState(draft.name);
	const [description, setDescription] = useState(draft.description || "");
	const [reviewerNotes, setReviewerNotes] = useState(draft.reviewerNotes || "");
	const [sections, setSections] = useState<TemplateDraftSectionItem[]>(draft.sections);
	const [targetStepCode, setTargetStepCode] = useState(draft.targetStepCode || "");

	const isReviewRequired = draft.status === "review_required" || draft.status === "draft";
	const isApproved = draft.status === "approved";
	const isConverted = draft.status === "converted_to_template";
	const isEditingLocked = isConverted;

	const targetStep = CERMONT_OPERATIONAL_STEPS.find((step) => step.code === draft.targetStepCode);
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
					<div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] p-3">
						<FileText className="size-6 text-[var(--color-brand)]" />
					</div>
					<div className="space-y-2">
						<input
							value={name}
							onChange={(event) => setName(event.target.value)}
							disabled={isEditingLocked}
							className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-xl font-bold text-[var(--text-primary)]"
						/>
						<textarea
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							disabled={isEditingLocked}
							rows={2}
							className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-secondary)]"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{!isEditingLocked && (
						<button
							type="button"
							onClick={() => void persistDraft()}
							className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] shadow-sm transition-colors hover:border-[var(--color-brand)]"
							disabled={updateDraft.isPending}
						>
							<Save className="size-4" />
							Guardar cambios
						</button>
					)}
					{draft.status === "draft" && (
						<button
							type="button"
							onClick={() => void handleSubmitForReview()}
							className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)]"
							disabled={submitForReview.isPending}
						>
							<Send className="size-4" />
							Enviar a revisión
						</button>
					)}
					{isReviewRequired && (
						<button
							type="button"
							onClick={() => void handleApprove()}
							className="flex items-center gap-2 rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-success-hover)]"
							disabled={approve.isPending}
						>
							<CheckCircle2 className="size-4" />
							Aprobar estructura
						</button>
					)}
					{isApproved && (
						<button
							type="button"
							onClick={() => convert.mutate(draft._id)}
							className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)]"
							disabled={convert.isPending}
						>
							<Send className="size-4" />
							Publicar plantilla
						</button>
					)}
					{isConverted && (
						<div className="flex items-center gap-2 rounded-lg border border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] px-4 py-2 text-sm font-bold text-[var(--color-brand)]">
							<CheckCircle2 className="size-4" />
							Plantilla publicada
						</div>
					)}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					{sections.length === 0 ? (
						<div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-12 text-center">
							<LayoutDashboard className="mx-auto mb-4 size-12 text-[var(--text-muted)] opacity-20" />
							<p className="text-sm text-[var(--text-secondary)]">No se detectaron secciones.</p>
						</div>
					) : (
						sections.map((section) => (
							<section
								key={section.sectionId}
								className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-sm"
							>
								<div className="mb-5 border-b border-[var(--border-subtle)] pb-3">
									<input
										value={section.title}
										onChange={(event) =>
											setSections((current) =>
												current.map((currentSection) =>
													currentSection.sectionId === section.sectionId
														? { ...currentSection, title: event.target.value }
														: currentSection,
												),
											)
										}
										disabled={isEditingLocked}
										className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-md font-bold text-[var(--text-primary)]"
									/>
									<textarea
										value={section.description || ""}
										onChange={(event) =>
											setSections((current) =>
												current.map((currentSection) =>
													currentSection.sectionId === section.sectionId
														? { ...currentSection, description: event.target.value }
														: currentSection,
												),
											)
										}
										disabled={isEditingLocked}
										rows={2}
										className="mt-2 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-[11px] text-[var(--text-muted)]"
									/>
								</div>

								<div className="grid gap-3">
									{section.fields.map((field) => (
										<div
											key={field.fieldId}
											className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4"
										>
											{!isEditingLocked && (
												<div className="mb-3 flex items-center justify-end gap-2">
													<button
														type="button"
														onClick={() => moveField(section.sectionId, field.fieldId, "up")}
														className="rounded border border-[var(--border-default)] p-1 text-[var(--text-muted)] hover:text-[var(--color-brand)]"
														aria-label="Subir campo"
													>
														<ArrowUp className="size-3.5" />
													</button>
													<button
														type="button"
														onClick={() => moveField(section.sectionId, field.fieldId, "down")}
														className="rounded border border-[var(--border-default)] p-1 text-[var(--text-muted)] hover:text-[var(--color-brand)]"
														aria-label="Bajar campo"
													>
														<ArrowDown className="size-3.5" />
													</button>
													<button
														type="button"
														onClick={() => removeField(section.sectionId, field.fieldId)}
														className="rounded border border-[var(--border-default)] p-1 text-[var(--color-danger)]"
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
														patchField(section.sectionId, field.fieldId, {
															label: event.target.value,
														})
													}
													disabled={isEditingLocked}
													className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-primary)]"
												/>
												<select
													value={field.fieldKind}
													onChange={(event) =>
														patchField(section.sectionId, field.fieldId, {
															fieldKind: event.target.value,
														})
													}
													disabled={isEditingLocked}
													className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-sm text-[var(--text-primary)]"
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
														patchField(section.sectionId, field.fieldId, {
															placeholder: event.target.value,
														})
													}
													disabled={isEditingLocked}
													placeholder="Placeholder"
													className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-xs text-[var(--text-secondary)]"
												/>
												<label className="flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
													<input
														type="checkbox"
														checked={field.required || false}
														onChange={(event) =>
															patchField(section.sectionId, field.fieldId, {
																required: event.target.checked,
															})
														}
														disabled={isEditingLocked}
													/>
													Campo obligatorio
												</label>
											</div>

											<textarea
												value={field.helpText || ""}
												onChange={(event) =>
													patchField(section.sectionId, field.fieldId, {
														helpText: event.target.value,
													})
												}
												disabled={isEditingLocked}
												rows={2}
												placeholder="Texto de ayuda"
												className="mt-3 w-full rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-xs text-[var(--text-secondary)]"
											/>

											{["select", "multi_select", "checklist"].includes(field.fieldKind) && (
												<div className="mt-3 space-y-2">
													<div className="flex items-center justify-between">
														<p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
															Opciones
														</p>
														<button
															type="button"
															onClick={() => addOption(section.sectionId, field.fieldId)}
															disabled={isEditingLocked}
															className="text-[10px] font-bold text-[var(--color-brand)]"
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
																	patchField(section.sectionId, field.fieldId, {
																		options: currentOptions,
																	});
																}}
																disabled={isEditingLocked}
																className="rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-xs text-[var(--text-primary)]"
															/>
														))}
													</div>
													<label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
														<input
															type="checkbox"
															checked={field.allowOtherOption || false}
															onChange={(event) =>
																patchField(section.sectionId, field.fieldId, {
																	allowOtherOption: event.target.checked,
																})
															}
															disabled={isEditingLocked}
														/>
														Permitir “otro, ¿cuál?”
													</label>
												</div>
											)}
										</div>
									))}
								</div>

								{!isEditingLocked && (
									<button
										type="button"
										onClick={() => addField(section.sectionId)}
										className="mt-4 inline-flex items-center gap-2 rounded-md border border-dashed border-[var(--color-brand)] px-3 py-2 text-xs font-bold text-[var(--color-brand)]"
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
							className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] px-4 py-3 text-sm font-bold text-[var(--color-brand)]"
						>
							<Plus className="size-4" />
							Agregar sección
						</button>
					)}
				</div>

				<div className="space-y-6">
					<div className="space-y-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card">
						<h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
							Configuración Operativa
						</h4>

						<div className="rounded-xl border border-[var(--color-brand-blue-border)] bg-[var(--color-brand-blue-bg)] p-4">
							<label
								htmlFor="draft-target-step"
								className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)]"
							>
								Paso operativo CERMONT
							</label>
							<select
								id="draft-target-step"
								value={targetStepCode}
								onChange={(event) => setTargetStepCode(event.target.value)}
								disabled={isEditingLocked}
								className="mt-2 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-primary)]"
							>
								<option value="">Sin asignar</option>
								{CERMONT_OPERATIONAL_STEPS.map((step) => (
									<option key={step.code} value={step.code}>
										{step.stepNumber}. {step.label}
									</option>
								))}
							</select>
							{targetStep && (
								<p className="mt-2 text-[11px] text-[var(--text-secondary)]">
									Fase {targetStep.phase === "operational" ? "operativa" : "administrativa"} ·{" "}
									{targetStep.requiredDocuments.length} documentos ·{" "}
									{targetStep.requiredForms.length} formularios
								</p>
							)}
						</div>

						<div className="space-y-2.5 px-1">
							<div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2 text-xs">
								<span className="text-[var(--text-muted)]">Campos configurados</span>
								<span className="font-bold text-[var(--text-primary)]">{totalFields}</span>
							</div>
							<div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2 text-xs">
								<span className="text-[var(--text-muted)]">Secciones</span>
								<span className="font-bold text-[var(--text-primary)]">{sections.length}</span>
							</div>
							<div className="flex items-center justify-between py-2 text-xs">
								<span className="text-[var(--text-muted)]">Confianza general</span>
								<span className="font-bold text-[var(--text-primary)]">
									{((draft.confidence || 0) * 100).toFixed(0)}%
								</span>
							</div>
						</div>

						<textarea
							value={reviewerNotes}
							onChange={(event) => setReviewerNotes(event.target.value)}
							rows={4}
							placeholder="Notas de revisión para la aprobación"
							className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-xs text-[var(--text-secondary)]"
						/>
					</div>

					<div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
						<div className="flex gap-3">
							<Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
							<p className="text-[10px] leading-relaxed text-[var(--text-secondary)]">
								<span className="font-bold text-[var(--text-primary)]">Regla de publicación:</span>{" "}
								la plantilla solo debe aprobarse cuando los campos, opciones y firmas requeridas
								representen la lógica real del paso objetivo.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
