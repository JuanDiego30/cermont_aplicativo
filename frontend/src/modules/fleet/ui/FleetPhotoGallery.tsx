"use client";

import { Camera, Loader2, Star, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useFleetPhotos } from "../hooks/useFleetPhotos";

interface FleetPhotoGalleryProps {
	vehicleId: string;
	canManage: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function FleetPhotoGallery({ vehicleId, canManage }: FleetPhotoGalleryProps) {
	const { photos, isLoading, error, handleUpload, handleSetPrimary, handleDelete, isUploading } =
		useFleetPhotos(vehicleId);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [photoTitle, setPhotoTitle] = useState("");

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				toast.error("La imagen no debe superar 10MB");
				return;
			}
			if (!ACCEPTED_TYPES.includes(file.type)) {
				toast.error("Formato no válido. Use JPG, PNG o WebP");
				return;
			}
			setSelectedFile(file);
		}
	}, []);

	const handleSubmitUpload = useCallback(() => {
		if (!selectedFile) {
			return;
		}
		handleUpload(selectedFile, photoTitle || undefined);
		setSelectedFile(null);
		setPhotoTitle("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [selectedFile, photoTitle, handleUpload]);

	const primary = photos.find((p) => p.isPrimary);
	const gallery = photos.filter((p) => !p.isPrimary);

	if (isLoading) {
		return (
			<section className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
				<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
				<span className="text-sm text-[var(--text-secondary)]">Cargando fotos…</span>
			</section>
		);
	}

	if (error) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-4 text-sm text-[var(--color-danger)]">
				Error al cargar las fotos del vehículo.
			</section>
		);
	}

	return (
		<section aria-labelledby="fleet-photos-title" className="space-y-4">
			<h2 id="fleet-photos-title" className="text-base font-semibold text-[var(--text-primary)]">
				Fotos del vehículo
			</h2>

			{/* Upload area */}
			{canManage ? (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)]/30 p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
						<div className="flex-1">
							<label
								htmlFor="fleet-photo-file"
								className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
							>
								Agregar foto
							</label>
							<input
								ref={fileInputRef}
								id="fleet-photo-file"
								type="file"
								accept={ACCEPTED_TYPES.join(",")}
								onChange={handleFileChange}
								className="w-full text-sm text-[var(--text-primary)] file:mr-3 file:rounded-[var(--radius-lg)] file:border-0 file:bg-[var(--color-brand-blue)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
							/>
						</div>
						{selectedFile && (
							<>
								<div className="w-full sm:w-48">
									<label
										htmlFor="fleet-photo-title"
										className="mb-1 block text-xs font-medium text-[var(--text-secondary)]"
									>
										Título (opcional)
									</label>
									<input
										id="fleet-photo-title"
										type="text"
										value={photoTitle}
										onChange={(e) => setPhotoTitle(e.target.value)}
										placeholder="Ej: Frente del vehículo"
										maxLength={100}
										className="w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-1.5 text-sm"
									/>
								</div>
								<button
									type="button"
									disabled={isUploading}
									onClick={handleSubmitUpload}
									className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
								>
									{isUploading ? (
										<Loader2 className="size-4 animate-spin" aria-hidden="true" />
									) : (
										<Upload className="size-4" aria-hidden="true" />
									)}
									Subir
								</button>
							</>
						)}
					</div>
				</div>
			) : null}

			{/* Primary photo */}
			{primary && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-[var(--text-secondary)]">Foto principal</p>
					<div className="relative aspect-video w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
						<Image
							src={primary.url}
							alt={primary.title || "Foto principal"}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 400px"
							unoptimized
						/>
						<div className="absolute left-2 top-2 rounded-full bg-[var(--color-brand-blue)] px-2 py-0.5 text-[10px] font-medium text-white">
							Principal
						</div>
					</div>
				</div>
			)}

			{/* Gallery */}
			{gallery.length > 0 && (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{gallery.map((photo) => (
						<div
							key={photo.id}
							className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
						>
							<Image
								src={photo.url}
								alt={photo.title || "Foto"}
								fill
								className="object-cover"
								sizes="(max-width: 640px) 50vw, 200px"
								unoptimized
							/>
							{canManage ? (
								<div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
									<button
										type="button"
										onClick={() => handleSetPrimary(photo.id)}
										className="rounded-full bg-white/90 p-1.5 text-xs text-[var(--text-primary)] hover:bg-white"
										aria-label="Establecer como principal"
									>
										<Star className="size-3.5" aria-hidden="true" />
									</button>
									<button
										type="button"
										onClick={() => handleDelete(photo.id)}
										className="rounded-full bg-white/90 p-1.5 text-xs text-[var(--color-danger)] hover:bg-white"
										aria-label="Eliminar foto"
									>
										<Trash2 className="size-3.5" aria-hidden="true" />
									</button>
								</div>
							) : null}
						</div>
					))}
				</div>
			)}

			{photos.length === 0 && (
				<div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-8 text-center">
					<Camera className="size-8 text-[var(--text-tertiary)]" aria-hidden="true" />
					<p className="text-sm text-[var(--text-secondary)]">
						Aún no hay fotos para este vehículo.
					</p>
				</div>
			)}
		</section>
	);
}
