"use client";

import type { ChecklistItem, ChecklistItemResult } from "@cermont/shared-types";
import { AlertTriangle, Camera, Check, FileSignature, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { ImageUploadField } from "@/modules/files/ui/ImageUploadField";

interface ChecklistItemControlProps {
	item: ChecklistItem;
	checklistId: string;
	disabled: boolean;
	onResult: (result: ChecklistItemResult, observation: string) => void;
	onEvidenceUploaded: () => void;
}

export function ChecklistItemControl({
	item,
	checklistId,
	disabled,
	onResult,
	onEvidenceUploaded,
}: ChecklistItemControlProps) {
	const [showFailureForm, setShowFailureForm] = useState(item.result === "failed");
	const [observation, setObservation] = useState(item.observation ?? "");
	const [hasPhoto, setHasPhoto] = useState(item.evidenceAssetIds.length > 0);
	const photoRequired = item.requiresPhoto && !hasPhoto;
	const failureDescription = observation.trim();

	return (
		<article className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="min-w-0 space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-sm font-semibold text-[var(--text-primary)]">{item.description}</p>
						{item.isBlocking ? (
							<span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-danger)]/30 px-2 py-1 text-xs font-medium text-[var(--color-danger)]">
								<ShieldAlert className="size-3.5" aria-hidden="true" />
								Bloqueante
							</span>
						) : null}
						{item.requiresPhoto ? (
							<span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-medium)] px-2 py-1 text-xs text-[var(--text-secondary)]">
								<Camera className="size-3.5" aria-hidden="true" />
								Requiere foto
							</span>
						) : null}
						{item.requiresSignature ? (
							<span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-medium)] px-2 py-1 text-xs text-[var(--text-secondary)]">
								<FileSignature className="size-3.5" aria-hidden="true" />
								Requiere firma
							</span>
						) : null}
					</div>

					{item.result === "failed" && item.observation ? (
						<p className="flex items-start gap-2 text-sm text-[var(--color-danger)]">
							<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
							{item.observation}
						</p>
					) : null}
				</div>

				<div className="flex shrink-0 flex-wrap gap-2">
					<Button
						type="button"
						size="sm"
						variant={item.result === "passed" ? "default" : "outline"}
						disabled={disabled || photoRequired}
						onClick={() => onResult("passed", "")}
						aria-label="Aprobar control"
					>
						<Check aria-hidden="true" />
						Cumple
					</Button>
					<Button
						type="button"
						size="sm"
						variant={item.result === "failed" ? "destructive" : "outline"}
						disabled={disabled}
						onClick={() => setShowFailureForm(true)}
						aria-label="Reportar hallazgo"
					>
						<X aria-hidden="true" />
						No cumple
					</Button>
				</div>
			</div>

			{photoRequired ? (
				<div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
					<ImageUploadField
						entityType="checklist_item"
						entityId={checklistId}
						category="checklist_evidence"
						metadata={{ checklistItemId: item.id }}
						disabled={disabled}
						label="Adjuntar evidencia del control"
						helperText="La foto queda vinculada a este ítem y es obligatoria para aprobarlo."
						onSuccess={() => {
							setHasPhoto(true);
							onEvidenceUploaded();
						}}
					/>
				</div>
			) : null}

			{showFailureForm ? (
				<div className="mt-4 space-y-3 border-t border-[var(--border-subtle)] pt-4">
					<label className="block space-y-2 text-sm font-medium text-[var(--text-primary)]">
						Descripcion del hallazgo
						<textarea
							value={observation}
							onChange={(event) => setObservation(event.target.value)}
							disabled={disabled}
							rows={3}
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-focus-ring)] focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
							placeholder="Describe la condición, el riesgo y la acción requerida."
						/>
					</label>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							size="sm"
							variant="destructive"
							disabled={disabled || failureDescription.length === 0}
							onClick={() => onResult("failed", failureDescription)}
						>
							Guardar hallazgo
						</Button>
						<Button
							type="button"
							size="sm"
							variant="ghost"
							disabled={disabled}
							onClick={() => setShowFailureForm(false)}
						>
							Cancelar
						</Button>
					</div>
				</div>
			) : null}
		</article>
	);
}
