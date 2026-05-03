"use client";

import {
	DocumentCategorySchema,
	DocumentPhaseSchema,
	UploadDocumentSchema,
} from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, Loader2, Upload } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/_shared/lib/http/api-client";
import { CreatableSelectField } from "@/core/ui/CreatableSelectField";

const DocumentFormSchema = UploadDocumentSchema.extend({
	file: z
		.instanceof(File, { message: "Seleccione un archivo" })
		.refine((file) => file.size <= 10 * 1024 * 1024, {
			message: "El archivo no debe superar 10MB",
		}),
});

const FIELD_CLASS =
	"w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/15";

type DocumentFormInput = z.infer<typeof DocumentFormSchema>;
type DocumentFormValues = z.input<typeof DocumentFormSchema>;

interface OrderOption {
	id: string;
	code?: string;
	assetName?: string;
	location?: string;
	number?: string;
	client?: string;
}

interface DocumentUploaderProps extends React.ComponentProps<"div"> {
	orders?: OrderOption[];
	defaultOrderId?: string;
	defaultCategory?: DocumentFormInput["category"];
	defaultPhase?: DocumentFormInput["phase"];
	allowedCategories?: DocumentFormInput["category"][];
}

export function DocumentUploader({
	orders,
	defaultOrderId,
	defaultCategory = "general",
	defaultPhase = "planning",
	allowedCategories = DocumentCategorySchema.options,
	className,
	...rest
}: DocumentUploaderProps) {
	const qc = useQueryClient();

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<DocumentFormValues>({
		resolver: zodResolver(DocumentFormSchema),
		defaultValues: {
			title: "",
			category: defaultCategory,
			phase: defaultPhase,
			orderId: defaultOrderId ?? "",
		},
	});

	const selectedFile = watch("file");

	const uploadMutation = useMutation({
		mutationFn: async (data: DocumentFormInput) => {
			const formData = new FormData();
			formData.append("file", data.file);
			formData.append("title", data.title);
			formData.append("category", data.category);
			if (data.phase) {
				formData.append("phase", data.phase);
			}
			if (data.orderId) {
				formData.append("order_id", data.orderId);
			}
			return apiClient.post<{ success: boolean }>("/documents", formData);
		},
		onSuccess: () => {
			toast.success("Documento subido correctamente");
			reset({
				title: "",
				category: defaultCategory,
				phase: defaultPhase,
				orderId: defaultOrderId ?? "",
			});
			void qc.invalidateQueries({ queryKey: ["documents"] });
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Error al subir el documento");
		},
	});

	const onSubmit = (data: DocumentFormValues) => {
		uploadMutation.mutate(DocumentFormSchema.parse(data));
	};

	const getOrderLabel = (order: OrderOption) => {
		if (order.code || order.assetName) {
			return [order.code, order.assetName, order.location].filter(Boolean).join(" — ");
		}

		if (order.number || order.client) {
			return [order.number, order.client].filter(Boolean).join(" - ");
		}

		return order.id;
	};

	return (
		<div className={`w-full ${className ?? ""}`} {...rest}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<fieldset className="space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 sm:p-6">
					<legend className="flex items-center gap-2 px-2 text-sm font-semibold text-[var(--text-primary)]">
						<FileUp className="h-4 w-4" aria-hidden="true" />
						Subir documento
					</legend>

					<div className="space-y-2">
						<label
							htmlFor="doc-title"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Título del documento
						</label>
						<input
							id="doc-title"
							type="text"
							{...register("title")}
							placeholder="Ej: Informe técnico #123"
							className={FIELD_CLASS}
						/>
						{errors.title && (
							<p className="text-xs text-[var(--color-danger)]" role="alert">
								{errors.title.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="doc-file"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Archivo
						</label>
						<input
							id="doc-file"
							type="file"
							accept=".pdf,.doc,.docx,.xls,.xlsx"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									setValue("file", file, { shouldValidate: true });
								}
							}}
							className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--surface-secondary)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--text-secondary)] hover:file:bg-[var(--surface-elevated)]"
						/>
						{selectedFile && (
							<p className="text-xs text-[var(--text-tertiary)]">
								{(selectedFile.size / 1024).toFixed(1)} KB — {selectedFile.name}
							</p>
						)}
						{errors.file && (
							<p className="text-xs text-[var(--color-danger)]" role="alert">
								{errors.file.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="doc-phase"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Fase operativa
						</label>
						<select id="doc-phase" {...register("phase")} className={FIELD_CLASS}>
							{DocumentPhaseSchema.options.map((phase) => (
								<option key={phase} value={phase}>
									{getPhaseLabel(phase)}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="doc-category"
							className="block text-sm font-medium text-[var(--text-secondary)]"
						>
							Categoría
						</label>
						<select id="doc-category" {...register("category")} className={FIELD_CLASS}>
							{allowedCategories.map((category) => (
								<option key={category} value={category}>
									{getCategoryLabel(category)}
								</option>
							))}
						</select>
					</div>

					{orders && orders.length > 1 && (
						<CreatableSelectField
							id="doc-order"
							label="Orden de trabajo"
							value={watch("orderId") ?? ""}
							onValueChange={(value) => setValue("orderId", value, { shouldValidate: true })}
							options={[
								{ value: "", label: "Sin orden" },
								...orders.map((order) => ({
									value: order.id,
									label: getOrderLabel(order),
								})),
							]}
							placeholder="Buscar OT o escribir referencia"
						/>
					)}

					<button
						type="submit"
						disabled={isSubmitting || uploadMutation.isPending}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-medium text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition-colors hover:bg-[var(--color-brand-blue-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface-primary)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
					>
						{uploadMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
								Subiendo...
							</>
						) : (
							<>
								<Upload className="h-4 w-4" aria-hidden="true" />
								Subir documento
							</>
						)}
					</button>
				</fieldset>
			</form>
		</div>
	);
}

function getPhaseLabel(phase: DocumentFormInput["phase"]): string {
	switch (phase) {
		case "execution":
			return "Ejecución";
		case "closure":
			return "Cierre";
		default:
			return "Planeación";
	}
}

function getCategoryLabel(category: DocumentFormInput["category"]): string {
	switch (category) {
		case "ast":
			return "AST";
		case "support":
			return "Soporte operativo";
		case "delivery_record":
			return "Acta de entrega";
		case "billing_support":
			return "Soporte de facturación";
		default:
			return "General";
	}
}
