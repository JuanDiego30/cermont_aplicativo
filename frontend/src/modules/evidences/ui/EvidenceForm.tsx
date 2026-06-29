"use client";

import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useOfflineEvidence } from "@/modules/evidences/hooks/useOfflineEvidence";

const FIELD_CLASS =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue)]/15";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface EvidenceFormProps {
	selectedOrderId: string;
	onUploadComplete: () => void;
}

export function EvidenceForm({ selectedOrderId, onUploadComplete }: EvidenceFormProps) {
	const uploadMutation = useOfflineEvidence();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const previewUrl = useMemo(
		() => (selectedFile ? URL.createObjectURL(selectedFile) : null),
		[selectedFile],
	);
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);
	const [evidenceTitle, setEvidenceTitle] = useState("");
	const [evidenceDesc, setEvidenceDesc] = useState("");
	const [isUploading, setIsUploading] = useState(false);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				toast.error("El archivo no debe superar 10MB");
				return;
			}
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				toast.error("Formato no válido. Use JPG, PNG o WebP");
				return;
			}
			setSelectedFile(file);
		}
	}, []);

	const resetForm = useCallback(() => {
		setSelectedFile(null);
		setEvidenceTitle("");
		setEvidenceDesc("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const handleUpload = useCallback(async () => {
		if (!selectedFile || !selectedOrderId) {
			return;
		}
		if (!evidenceTitle.trim()) {
			toast.error("Agrega un título que describa esta evidencia");
			return;
		}

		setIsUploading(true);
		try {
			const description = evidenceDesc.trim()
				? `${evidenceTitle.trim()} — ${evidenceDesc.trim()}`
				: evidenceTitle.trim();

			const result = await uploadMutation.mutateAsync({
				orderId: selectedOrderId,
				type: "during",
				description,
				capturedAt: new Date().toISOString(),
				file: selectedFile,
			});

			if (result) {
				toast.success("Evidencia subida correctamente");
			} else {
				toast.info("Evidencia guardada para sincronizar cuando haya conexión");
			}

			resetForm();
			onUploadComplete();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al subir la evidencia");
		} finally {
			setIsUploading(false);
		}
	}, [
		selectedFile,
		selectedOrderId,
		evidenceTitle,
		evidenceDesc,
		uploadMutation,
		resetForm,
		onUploadComplete,
	]);

	const canUpload = !!selectedOrderId && !!selectedFile && !!evidenceTitle.trim() && !isUploading;

	return (
		<section
			aria-label="Subir evidencia del trabajo realizado"
			className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)] sm:p-6"
		>
			<div className="mb-4 flex items-center gap-2">
				<h2 className="text-base font-semibold text-[var(--text-primary)]">
					Evidencia del trabajo realizado
				</h2>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label
						htmlFor="ev-title"
						className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
					>
						Título <span className="text-[var(--color-danger)]">*</span>
					</label>
					<input
						id="ev-title"
						type="text"
						value={evidenceTitle}
						onChange={(e) => setEvidenceTitle(e.target.value)}
						placeholder="¿Qué muestra esta evidencia?"
						maxLength={200}
						className={FIELD_CLASS}
					/>
				</div>
			</div>

			<div className="mt-3">
				<label
					htmlFor="ev-desc"
					className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
				>
					Descripción adicional
				</label>
				<textarea
					id="ev-desc"
					value={evidenceDesc}
					onChange={(e) => setEvidenceDesc(e.target.value)}
					placeholder="Detalles de lo que se trabajó, hallazgos, observaciones…"
					maxLength={500}
					rows={2}
					className={FIELD_CLASS}
				/>
			</div>

			<div className="mt-3">
				<label
					htmlFor="ev-file-upload"
					className={`relative block cursor-pointer rounded-[var(--radius-lg)] border-2 border-dashed p-5 text-center transition-colors sm:p-6 ${
						previewUrl
							? "border-[var(--color-brand-blue)]/30"
							: "border-[var(--border-subtle)] hover:border-[var(--color-brand-blue)]/50"
					}`}
				>
					<input
						ref={fileInputRef}
						id="ev-file-upload"
						type="file"
						accept="image/jpeg,image/jpg,image/png,image/webp"
						className="hidden"
						onChange={handleFileChange}
					/>

					{previewUrl ? (
						<div className="space-y-3">
							<div className="relative mx-auto h-40 w-full max-w-sm overflow-hidden rounded-[var(--radius-lg)]">
								<Image
									src={previewUrl}
									alt="Vista previa"
									fill
									unoptimized
									className="object-cover"
									sizes="(max-width: 640px) 100vw, 384px"
								/>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										resetForm();
									}}
									className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
									aria-label="Quitar imagen"
								>
									<X className="size-4" />
								</button>
							</div>
							<p className="text-xs text-[var(--text-tertiary)]">
								{selectedFile?.name} (
								{(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(1)} MB)
							</p>
						</div>
					) : (
						<div>
							<ImageIcon
								className="mx-auto mb-2 size-10 text-[var(--text-tertiary)]"
								aria-hidden="true"
							/>
							<p className="text-sm font-medium text-[var(--text-primary)]">
								Arrastra una imagen o haz clic para seleccionar
							</p>
							<p className="mt-1 text-xs text-[var(--text-tertiary)]">JPG, PNG, WebP — Máx 10MB</p>
						</div>
					)}
				</label>
			</div>

			<button
				type="button"
				disabled={!canUpload}
				onClick={handleUpload}
				className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
			>
				{isUploading ? (
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
				) : (
					<Upload className="size-4" aria-hidden="true" />
				)}
				{isUploading ? "Subiendo…" : "Subir evidencia"}
			</button>
		</section>
	);
}
