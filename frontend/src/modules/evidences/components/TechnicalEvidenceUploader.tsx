"use client";

import type { CermontOperationalStepCode, FileAssetRef } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Camera, CheckCircle, Clock, Upload, X } from "lucide-react";

import Image from "next/image";
import { useRef, useState } from "react";
import { enqueueBlobUpload } from "@/lib/offline/blob-outbox";
import { listFilesByEntity, uploadFile } from "@/modules/files/api/files.api";
import { useOfflineStore } from "@/store/offline.store";

// ── Local Types ────────────────────────────────────────────────────

type BeforeAfter = "before" | "during" | "after";
type TechCategory = "cctv" | "lineas_de_vida" | "installation" | "safety" | "measurement" | "other";

// ── Label/Style Constants ──────────────────────────────────────────

const BEFORE_AFTER_LABELS: Record<BeforeAfter, string> = {
	before: "Antes del trabajo",
	during: "Durante ejecución",
	after: "Después / resultado",
};

const BEFORE_AFTER_BADGE_COLORS: Record<BeforeAfter, string> = {
	before: "border-blue-200 bg-blue-50 text-blue-700",
	during: "border-amber-200 bg-amber-50 text-amber-700",
	after: "border-green-200 bg-green-50 text-green-700",
};

const TECH_CATEGORY_LABELS: Record<TechCategory, string> = {
	cctv: "CCTV",
	lineas_de_vida: "Líneas de vida",
	installation: "Instalación",
	safety: "Seguridad",
	measurement: "Medición",
	other: "Otro",
};

const FILE_CATEGORY_MAP = {
	before: "before_photo",
	during: "evidence_photo",
	after: "after_photo",
} as const;

const EVIDENCE_QUERY_KEY = (orderId: string) => ["evidence-files", "work_order", orderId] as const;

// ── Metadata encoding into tags ────────────────────────────────────

function buildTechTags(meta: {
	componentName: string;
	photoLabel: string;
	beforeAfter: BeforeAfter;
	techCategory: TechCategory;
}): string[] {
	const tags: string[] = [`ba:${meta.beforeAfter}`, `cat:${meta.techCategory}`];
	if (meta.componentName.trim()) {
		tags.push(`comp:${meta.componentName.trim().slice(0, 44)}`);
	}
	if (meta.photoLabel.trim()) {
		tags.push(`label:${meta.photoLabel.trim().slice(0, 43)}`);
	}
	return tags;
}

function parseTechMetadata(tags: string[] = []): {
	componentName?: string;
	photoLabel?: string;
	beforeAfter?: BeforeAfter;
	techCategory?: TechCategory;
} {
	const result: ReturnType<typeof parseTechMetadata> = {};
	for (const tag of tags) {
		if (tag.startsWith("comp:")) {
			result.componentName = tag.slice(5);
		} else if (tag.startsWith("label:")) {
			result.photoLabel = tag.slice(6);
		} else if (tag.startsWith("ba:")) {
			result.beforeAfter = tag.slice(3) as BeforeAfter;
		} else if (tag.startsWith("cat:")) {
			result.techCategory = tag.slice(4) as TechCategory;
		}
	}
	return result;
}

// ── Sub-components ─────────────────────────────────────────────────

function EvidenceCard({ file }: { file: FileAssetRef }) {
	const meta = parseTechMetadata(file.tags);
	const badgeColor = meta.beforeAfter
		? BEFORE_AFTER_BADGE_COLORS[meta.beforeAfter]
		: "border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-muted)]";
	const badgeLabel = meta.beforeAfter ? BEFORE_AFTER_LABELS[meta.beforeAfter] : "—";

	return (
		<div className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
			<div className="shrink-0">
				{(file.thumbnailUrl ?? file.url) ? (
					<Image
						src={(file.thumbnailUrl ?? file.url) as string}
						alt={meta.photoLabel ?? file.originalName}
						width={64}
						height={64}
						className="size-16 rounded-[var(--radius-md)] object-cover"
					/>
				) : (
					<div className="flex size-16 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-200)]">
						<Camera className="size-6 text-[var(--text-muted)]" />
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-semibold text-[var(--text-primary)]">
					{meta.componentName ?? meta.photoLabel ?? file.originalName}
				</p>
				{meta.componentName && meta.photoLabel && (
					<p className="truncate text-[11px] text-[var(--text-muted)]">{meta.photoLabel}</p>
				)}
				<div className="mt-1.5 flex flex-wrap gap-1">
					<span
						className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${badgeColor}`}
					>
						{badgeLabel}
					</span>
					{meta.techCategory && (
						<span className="inline-flex rounded-full border border-[var(--border-subtle)] bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--text-muted)]">
							{TECH_CATEGORY_LABELS[meta.techCategory] ?? meta.techCategory}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

// ── Main Component ─────────────────────────────────────────────────

interface TechnicalEvidenceUploaderProps {
	orderId?: string;
	serviceCaseId: string;
	stepCode?: CermontOperationalStepCode;
}

type UploadState = "idle" | "uploading" | "success" | "queued" | "error";

export function TechnicalEvidenceUploader({
	orderId,
	serviceCaseId,
	stepCode,
}: TechnicalEvidenceUploaderProps) {
	const queryClient = useQueryClient();
	const isOnline = useOfflineStore((s) => s.isOnline);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [componentName, setComponentName] = useState("");
	const [photoLabel, setPhotoLabel] = useState("");
	const [beforeAfter, setBeforeAfter] = useState<BeforeAfter>("during");
	const [techCategory, setTechCategory] = useState<TechCategory>("other");
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploadState, setUploadState] = useState<UploadState>("idle");
	const [errorMsg, setErrorMsg] = useState("");

	const evidenceQueryKey = EVIDENCE_QUERY_KEY(orderId ?? "");

	const { data: uploadedFiles = [] } = useQuery({
		queryKey: evidenceQueryKey,
		queryFn: () =>
			listFilesByEntity({
				entityType: "work_order",
				entityId: orderId ?? "",
				category: "evidence_photo",
			}),
		enabled: !!orderId,
	});

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			if (!orderId) {
				throw new Error("Se requiere orden de trabajo para subir evidencias");
			}
			const tags = buildTechTags({ componentName, photoLabel, beforeAfter, techCategory });
			const description =
				[componentName.trim(), photoLabel.trim()].filter(Boolean).join(" — ") || undefined;
			return uploadFile({
				file,
				entityType: "work_order",
				entityId: orderId,
				category: FILE_CATEGORY_MAP[beforeAfter],
				description,
				tags,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: evidenceQueryKey });
			setUploadState("success");
			resetForm();
		},
		onError: (err) => {
			const msg = err instanceof Error ? err.message : "Error al subir la evidencia";
			setErrorMsg(msg);
			setUploadState("error");
		},
	});

	function resetForm() {
		setPendingFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setPreviewUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setPendingFile(file);
		setPreviewUrl(file ? URL.createObjectURL(file) : null);
		setUploadState("idle");
		setErrorMsg("");
	}

	async function handleSubmit() {
		if (!pendingFile) {
			return;
		}
		setErrorMsg("");

		if (!orderId) {
			setErrorMsg(
				"Esta evidencia requiere una orden de trabajo activa. Completa los pasos anteriores primero.",
			);
			setUploadState("error");
			return;
		}

		if (!isOnline) {
			try {
				const tags = buildTechTags({ componentName, photoLabel, beforeAfter, techCategory });
				const description =
					[componentName.trim(), photoLabel.trim()].filter(Boolean).join(" — ") || undefined;
				await enqueueBlobUpload({
					file: pendingFile,
					entityType: "work_order",
					entityId: orderId,
					category: FILE_CATEGORY_MAP[beforeAfter],
					description,
					tags,
					clientMutationId: `tech-ev:${serviceCaseId}:${stepCode ?? ""}:${Date.now()}`,
				});
				setUploadState("queued");
				resetForm();
			} catch {
				setErrorMsg("No se pudo guardar la evidencia localmente. Intenta de nuevo.");
				setUploadState("error");
			}
			return;
		}

		setUploadState("uploading");
		uploadMutation.mutate(pendingFile);
	}

	const isSubmitting = uploadState === "uploading";
	const canSubmit = !!pendingFile && !isSubmitting;

	return (
		<div className="space-y-4">
			{/* Upload form */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
				<div className="mb-4 flex items-center gap-2">
					<Camera className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					<p className="text-sm font-semibold text-[var(--text-primary)]">
						Evidencia técnica fotográfica
					</p>
					{!isOnline && (
						<span className="ml-auto rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
							Offline — se sincronizará
						</span>
					)}
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					{/* Component name */}
					<div>
						<label
							htmlFor="ev-component"
							className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
						>
							Componente / elemento
						</label>
						<input
							id="ev-component"
							type="text"
							className="field-input"
							placeholder="Cámara entrada, Anclaje D4, Cable GND…"
							value={componentName}
							maxLength={100}
							onChange={(e) => setComponentName(e.target.value)}
						/>
					</div>

					{/* Photo label */}
					<div>
						<label
							htmlFor="ev-label"
							className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
						>
							Etiqueta de foto
						</label>
						<input
							id="ev-label"
							type="text"
							className="field-input"
							placeholder="Estado inicial, Prueba de voltaje, Torque…"
							value={photoLabel}
							maxLength={100}
							onChange={(e) => setPhotoLabel(e.target.value)}
						/>
					</div>

					{/* Before/After */}
					<div>
						<label
							htmlFor="ev-ba"
							className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
						>
							Momento de captura
						</label>
						<select
							id="ev-ba"
							className="field-input"
							value={beforeAfter}
							onChange={(e) => setBeforeAfter(e.target.value as BeforeAfter)}
						>
							<option value="before">Antes del trabajo</option>
							<option value="during">Durante ejecución</option>
							<option value="after">Después / resultado</option>
						</select>
					</div>

					{/* Tech category */}
					<div>
						<label
							htmlFor="ev-cat"
							className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
						>
							Tipo de evidencia
						</label>
						<select
							id="ev-cat"
							className="field-input"
							value={techCategory}
							onChange={(e) => setTechCategory(e.target.value as TechCategory)}
						>
							{(Object.keys(TECH_CATEGORY_LABELS) as TechCategory[]).map((val) => (
								<option key={val} value={val}>
									{TECH_CATEGORY_LABELS[val]}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* File input + preview */}
				<div className="mt-3">
					<label
						htmlFor="ev-file"
						className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
					>
						Archivo de imagen
					</label>
					<div className="flex items-start gap-3">
						<div className="flex-1">
							<input
								ref={fileInputRef}
								id="ev-file"
								type="file"
								accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
								className="block w-full text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-[var(--radius-md)] file:border file:border-[var(--border-default)] file:bg-[var(--surface-secondary)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--text-primary)] hover:file:border-[var(--color-brand)]"
								onChange={handleFileChange}
							/>
						</div>
						{previewUrl && (
							<div className="relative shrink-0">
								<img
									src={previewUrl}
									alt="Vista previa"
									width={64}
									height={64}
									className="size-16 rounded-[var(--radius-md)] object-cover"
								/>
								<button
									type="button"
									onClick={resetForm}
									aria-label="Eliminar imagen seleccionada"
									className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-white"
								>
									<X className="size-2.5" aria-hidden="true" />
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Status feedback */}
				{uploadState === "success" && (
					<div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
						<CheckCircle className="size-4" aria-hidden="true" />
						Evidencia subida correctamente
					</div>
				)}
				{uploadState === "queued" && (
					<div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
						<Clock className="size-4" aria-hidden="true" />
						Guardada localmente — se subirá al recuperar conexión
					</div>
				)}
				{uploadState === "error" && (
					<div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						<AlertCircle className="size-4" aria-hidden="true" />
						{errorMsg}
					</div>
				)}

				<button
					type="button"
					disabled={!canSubmit}
					onClick={handleSubmit}
					className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Upload className="size-4" aria-hidden="true" />
					{isSubmitting ? "Subiendo…" : isOnline ? "Registrar evidencia" : "Guardar offline"}
				</button>
			</div>

			{/* Uploaded evidence list */}
			{uploadedFiles.length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
					<p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
						Evidencias registradas ({uploadedFiles.length})
					</p>
					<div className="grid gap-3 sm:grid-cols-2">
						{uploadedFiles.map((file) => (
							<EvidenceCard key={file.id} file={file} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
