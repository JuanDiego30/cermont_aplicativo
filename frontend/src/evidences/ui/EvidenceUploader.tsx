"use client";

import { CreateEvidenceSchema, type EvidenceType } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useOfflineEvidence } from "..";

const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
	{ value: "before", label: "Before" },
	{ value: "during", label: "During" },
	{ value: "after", label: "After" },
	{ value: "defect", label: "Defect" },
	{ value: "safety", label: "HSE safety" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const EvidenceFormSchema = CreateEvidenceSchema.extend({
	file: z
		.instanceof(File, { message: "Select a file" })
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: "File must be 10 MB or smaller",
		})
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
			message: "Unsupported format. Use JPG, PNG, or WebP",
		}),
});

type EvidenceFormValues = z.input<typeof EvidenceFormSchema>;

const FIELD_CLASS =
	"w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

interface EvidenceUploaderProps {
	orderId?: string;
}

export function EvidenceUploader({ orderId }: EvidenceUploaderProps) {
	const [preview, setPreview] = useState("");
	const uploadMutation = useOfflineEvidence();

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		resetField,
		formState: { errors, isSubmitting },
	} = useForm<EvidenceFormValues>({
		resolver: zodResolver(EvidenceFormSchema),
		defaultValues: {
			orderId: orderId ?? "",
			type: "before",
			description: "",
			capturedAt: new Date().toISOString(),
		},
	});

	const handleFileChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
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
		setPreview("");
		resetField("file");
	}, [preview, resetField]);

	const onSubmit = async (data: EvidenceFormValues) => {
		try {
			const result = await uploadMutation.mutateAsync(EvidenceFormSchema.parse(data));

			if (result) {
				toast.success("Evidence uploaded successfully");
			} else {
				toast.info("Evidence saved for sync");
			}

			reset({
				orderId: orderId ?? "",
				type: "before",
				description: "",
				capturedAt: new Date().toISOString(),
			});
			setPreview("");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Evidence upload failed");
		}
	};

	return (
		<section aria-label="Upload photographic evidence" className="space-y-6">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<fieldset className="space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 sm:p-6">
					<legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">
						New evidence
					</legend>

					<div className="space-y-2">
						<label
							htmlFor="evidence-type"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Evidence type
						</label>
						<select id="evidence-type" {...register("type")} className={FIELD_CLASS}>
							{EVIDENCE_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</select>
						{errors.type && (
							<p className="text-xs text-[var(--color-danger)]" role="alert">
								{errors.type.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="evidence-description"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Description
						</label>
						<textarea
							id="evidence-description"
							rows={3}
							{...register("description")}
							placeholder="Add an evidence description..."
							className={FIELD_CLASS}
						/>
						{errors.description && (
							<p className="text-xs text-[var(--color-danger)]" role="alert">
								{errors.description.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="evidence-file"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Image
						</label>
						{/* biome-ignore lint/a11y/useSemanticElements: contains nested button for remove action */}
						<div
							className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
								preview
									? "border-[var(--border-default)]"
									: errors.file
										? "border-[var(--color-danger)]"
										: "border-[var(--border-default)] hover:border-[var(--border-strong)]"
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
							aria-label="Select image"
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
											alt="Evidence preview"
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
											className="absolute right-2 top-2 rounded-full bg-[oklch(0.16_0.035_260_/_0.72)] p-1 text-[var(--text-inverse)] hover:bg-[oklch(0.16_0.035_260_/_0.9)]"
											aria-label="Remove preview"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
									<p className="text-xs text-[var(--text-tertiary)]">Click to change the image</p>
								</div>
							) : (
								<div>
									<ImageIcon
										className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]"
										aria-hidden="true"
									/>
									<p className="text-sm font-medium text-[var(--text-secondary)]">
										Drag an image or click to select
									</p>
									<p className="mt-1 text-xs text-[var(--text-tertiary)]">
										JPG, PNG, WebP up to 10 MB
									</p>
								</div>
							)}
						</div>
						{errors.file && (
							<p className="text-xs text-[var(--color-danger)]" role="alert">
								{errors.file.message}
							</p>
						)}
					</div>
				</fieldset>

				<button
					type="submit"
					disabled={isSubmitting || uploadMutation.isPending}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--color-brand-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				>
					<Upload className="h-4 w-4" />
					{isSubmitting || uploadMutation.isPending ? "Uploading..." : "Upload evidence"}
				</button>
			</form>
		</section>
	);
}
