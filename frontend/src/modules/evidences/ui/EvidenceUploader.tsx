"use client";

import { CreateEvidenceSchema, type EvidenceType } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useOfflineEvidence } from "../hooks/useOfflineEvidence";

const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
	{ value: "before", label: "Antes" },
	{ value: "during", label: "Durante" },
	{ value: "after", label: "Después" },
	{ value: "defect", label: "Defecto" },
	{ value: "safety", label: "Seguridad HSE" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const EvidenceFormSchema = CreateEvidenceSchema.extend({
	file: z
		.instanceof(File, { message: "Seleccione un archivo" })
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: "El archivo no debe superar 10MB",
		})
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
			message: "Formato no válido. Use JPG, PNG o WebP",
		}),
});

type EvidenceFormInput = z.infer<typeof EvidenceFormSchema>;

interface EvidenceUploaderProps {
	orderId?: string;
}

export function EvidenceUploader({ orderId }: EvidenceUploaderProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const uploadMutation = useOfflineEvidence();

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EvidenceFormInput>({
		resolver: zodResolver(EvidenceFormSchema),
		defaultValues: {
			orderId: orderId ?? "",
			type: "before",
			description: "",
			capturedAt: new Date().toISOString(),
		},
	});

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				setValue("file", file, { shouldValidate: true });
				setPreview(URL.createObjectURL(file));
			}
		},
		[setValue],
	);

	const handleRemoveFile = useCallback(() => {
		if (preview) {
			URL.revokeObjectURL(preview);
		}
		setPreview(null);
		setValue("file", undefined as unknown as File, { shouldValidate: true });
	}, [preview, setValue]);

	const onSubmit = async (data: EvidenceFormInput) => {
		try {
			const result = await uploadMutation.mutateAsync(data);

			if (result) {
				toast.success("Evidencia subida correctamente");
			} else {
				toast.info("Evidencia guardada para sincronizar");
			}

			reset({
				orderId: orderId ?? "",
				type: "before",
				description: "",
				capturedAt: new Date().toISOString(),
			});
			setPreview(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al subir la evidencia");
		}
	};

	return (
		<section aria-label="Subir evidencia fotográfica" className="space-y-6">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<fieldset className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:p-6">
					<legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
						Nueva evidencia
					</legend>

					<div className="space-y-2">
						<label
							htmlFor="evidence-type"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Tipo de evidencia
						</label>
						<select
							id="evidence-type"
							{...register("type")}
							className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
						>
							{EVIDENCE_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</select>
						{errors.type && (
							<p className="text-xs text-red-600 dark:text-red-400" role="alert">
								{errors.type.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="evidence-description"
							className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
						>
							Descripción (opcional)
						</label>
						<textarea
							id="evidence-description"
							rows={3}
							{...register("description")}
							placeholder="Agregue una descripción de la evidencia…"
							className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
						/>
						{errors.description && (
							<p className="text-xs text-red-600 dark:text-red-400" role="alert">
								{errors.description.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Imagen
						</span>
						{/* biome-ignore lint/a11y/useSemanticElements: contains nested button for remove action */}
						<div
							className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
								preview
									? "border-zinc-300 dark:border-zinc-600"
									: errors.file
										? "border-red-400 dark:border-red-500"
										: "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
							}`}
							onClick={() => document.getElementById("evidence-file")?.click()}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									document.getElementById("evidence-file")?.click();
								}
							}}
							role="button"
							tabIndex={0}
							aria-label="Seleccionar imagen"
						>
							<input
								id="evidence-file"
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/webp"
								className="hidden"
								onChange={handleFileChange}
							/>
							{preview ? (
								<div className="space-y-3">
									<div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-lg">
										<Image
											src={preview}
											alt="Vista previa de evidencia"
											fill
											unoptimized
											className="object-cover"
											sizes="(max-width: 640px) 100vw, 384px"
										/>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoveFile();
											}}
											className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
											aria-label="Eliminar vista previa"
										>
											<X className="size-4" />
										</button>
									</div>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										Haga clic para cambiar la imagen
									</p>
								</div>
							) : (
								<div>
									<ImageIcon className="mx-auto mb-3 size-10 text-zinc-400" aria-hidden="true" />
									<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Arrastra una imagen o haz clic para seleccionar
									</p>
									<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
										JPG, PNG, WebP , Máx 10MB
									</p>
								</div>
							)}
						</div>
						{errors.file && (
							<p className="text-xs text-red-600 dark:text-red-400" role="alert">
								{errors.file.message}
							</p>
						)}
					</div>
				</fieldset>

				<button
					type="submit"
					disabled={isSubmitting || uploadMutation.isPending}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				>
					<Upload className="size-4" />
					{isSubmitting || uploadMutation.isPending ? "Subiendo…" : "Subir evidencia"}
				</button>
			</form>
		</section>
	);
}
