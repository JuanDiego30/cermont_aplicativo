"use client";

import type {
	ApiEnvelope,
	CermontOperationalStepCode,
	DocumentPurpose,
	Document as DocumentRecord,
} from "@cermont/shared-types";
import { CERMONT_OPERATIONAL_STEPS } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileUp, Loader2, Upload, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useState } from "react";
import {
	type FieldErrors,
	type UseFormRegister,
	type UseFormSetValue,
	type UseFormWatch,
	useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/lib/http/api-client";
import { useLibraryDocuments } from "../queries";

const PURPOSE_OPTIONS: Array<{
	description: string;
	icon: typeof BookOpen;
	label: string;
	value: DocumentPurpose;
}> = [
	{
		value: "library",
		label: "Guardar en biblioteca",
		description: "Normativa, instructivos o soporte general sin generar formulario.",
		icon: BookOpen,
	},
	{
		value: "template_source",
		label: "Convertir en formulario",
		description: "Sube un PDF/Excel/Word heredado para revisarlo como draft editable.",
		icon: WandSparkles,
	},
	{
		value: "closing_evidence",
		label: "Subir evidencia de cierre",
		description: "Acta, firma, SES, factura, pago o soporte administrativo del caso.",
		icon: Upload,
	},
	{
		value: "support_document",
		label: "Adjuntar soporte operativo",
		description: "Vincula AST, PTW, instructivos o anexos técnicos al paso actual.",
		icon: FileUp,
	},
];

const DocumentFormSchema = z
	.object({
		mode: z.enum(["upload", "select"]),
		selectedDocumentId: z.string().optional(),
		title: z.string().min(1, "El título es obligatorio"),
		purpose: z.enum(["library", "template_source", "closing_evidence", "support_document"]),
		targetStepCode: z.string().optional(),
		orderId: z.string().optional(),
		serviceCaseId: z.string().optional(),
		file: z.instanceof(File).optional(),
	})
	.superRefine((data, context) => {
		if (data.mode === "upload" && !data.file) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["file"],
				message: "Seleccione un archivo",
			});
		}

		if (data.mode === "upload" && data.file && data.file.size > 10 * 1024 * 1024) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["file"],
				message: "El archivo no debe superar 10MB",
			});
		}

		if (data.mode === "select" && !data.selectedDocumentId) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["selectedDocumentId"],
				message: "Seleccione un documento de la biblioteca",
			});
		}

		if (data.purpose === "closing_evidence" && !data.serviceCaseId) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["serviceCaseId"],
				message: "La evidencia de cierre debe asociarse a un caso de servicio",
			});
		}
	});

type DocumentFormInput = z.infer<typeof DocumentFormSchema>;

interface OrderOption {
	id: string;
	code?: string;
	assetName?: string;
	location?: string;
	number?: string;
	client?: string;
}

interface ServiceCaseOption {
	id: string;
	code?: string;
	clientName?: string;
}

interface IngestOutcome {
	classification?: string;
	draftId: string | null;
	status: string;
	targetStepCode?: CermontOperationalStepCode;
}

type DocumentUploaderMode = "upload" | "select";

interface UploadOutcome {
	document: DocumentRecord;
	ingest: IngestOutcome | null;
	mode: DocumentUploaderMode;
}

interface DocumentUploaderProps extends React.ComponentProps<"div"> {
	defaultOrderId?: string;
	defaultPurpose?: DocumentPurpose;
	defaultServiceCaseId?: string;
	defaultStepCode?: CermontOperationalStepCode;
	onUploaded?: (result: { document: DocumentRecord; ingest: IngestOutcome | null }) => void;
	orders?: OrderOption[];
	serviceCases?: ServiceCaseOption[];
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createClosingStepPattern(keywords: string[]): RegExp {
	return new RegExp(keywords.map((keyword) => `(?=.*${escapeRegExp(keyword)})`).join(""), "i");
}

const CLOSING_STEP_RULES: Array<{
	pattern: RegExp;
	step: CermontOperationalStepCode;
}> = [
	{
		pattern: createClosingStepPattern(["pago", "payment"]),
		step: "step_14_payment",
	},
	{
		pattern: createClosingStepPattern(["factura", "invoice", "aprob", "acept"]),
		step: "step_13_invoice_approval",
	},
	{
		pattern: createClosingStepPattern(["factura", "invoice"]),
		step: "step_12_invoice",
	},
	{
		pattern: createClosingStepPattern(["ses", "ariba"]),
		step: "step_11_ses",
	},
	{
		pattern: createClosingStepPattern(["firma", "signed"]),
		step: "step_10_client_signature",
	},
	{
		pattern: createClosingStepPattern(["acta", "entrega"]),
		step: "step_09_delivery_record",
	},
];

function suggestClosingStep(fileName: string): CermontOperationalStepCode | "" {
	const normalized = fileName.toLowerCase();
	for (const rule of CLOSING_STEP_RULES) {
		if (rule.pattern.test(normalized)) {
			return rule.step;
		}
	}
	return "";
}

function createDefaultValues({
	defaultOrderId,
	defaultPurpose,
	defaultServiceCaseId,
	defaultStepCode,
}: {
	defaultOrderId?: string;
	defaultPurpose: DocumentPurpose;
	defaultServiceCaseId?: string;
	defaultStepCode?: CermontOperationalStepCode;
}): {
	mode: DocumentUploaderMode;
	orderId: string;
	purpose: DocumentPurpose;
	selectedDocumentId: string;
	serviceCaseId: string;
	targetStepCode: CermontOperationalStepCode | "";
	title: string;
} {
	return {
		mode: "upload",
		selectedDocumentId: "",
		title: "",
		purpose: defaultPurpose,
		targetStepCode: defaultStepCode ?? "",
		orderId: defaultOrderId ?? "",
		serviceCaseId: defaultServiceCaseId ?? "",
	};
}

function buildUploadFormData(data: DocumentFormInput): FormData {
	if (!data.file) {
		throw new Error("Seleccione un archivo");
	}
	const formData = new FormData();
	formData.append("file", data.file);
	formData.append("title", data.title);
	formData.append("purpose", data.purpose);
	if (data.targetStepCode) {
		formData.append("targetStepCode", data.targetStepCode);
	}
	if (data.orderId) {
		formData.append("order_id", data.orderId);
	}
	if (data.serviceCaseId) {
		formData.append("linkedEntityType", "service_case");
		formData.append("linkedEntityId", data.serviceCaseId);
	}
	return formData;
}

function buildAssociationPayload(data: DocumentFormInput) {
	return {
		purpose: data.purpose,
		targetStepCode: data.targetStepCode || undefined,
		orderId: data.orderId || undefined,
		serviceCaseId: data.serviceCaseId || undefined,
		linkedEntityType: data.serviceCaseId ? "service_case" : undefined,
		linkedEntityId: data.serviceCaseId || undefined,
	};
}

function resolveIngestMode(purpose: DocumentPurpose): string {
	if (purpose === "template_source") {
		return "convert_to_template";
	}
	if (purpose === "closing_evidence") {
		return "closing_evidence";
	}
	return "library";
}

function getOrderLabel(order: OrderOption): string {
	if (order.code || order.assetName) {
		return [order.code, order.assetName, order.location].filter(Boolean).join(" , ");
	}

	if (order.number || order.client) {
		return [order.number, order.client].filter(Boolean).join(" - ");
	}

	return order.id;
}

function applyFileSelection({
	file,
	selectedPurpose,
	setValue,
	watch,
}: {
	file: File;
	selectedPurpose: DocumentPurpose;
	setValue: UseFormSetValue<DocumentFormInput>;
	watch: UseFormWatch<DocumentFormInput>;
}) {
	setValue("file", file, { shouldValidate: true });
	if (!watch("title")) {
		setValue("title", file.name.replace(/\.[^/.]+$/, ""), { shouldValidate: true });
	}
	if (selectedPurpose === "closing_evidence") {
		setValue("targetStepCode", suggestClosingStep(file.name), { shouldValidate: true });
	}
}

async function handleSelectExistingDocument(data: DocumentFormInput): Promise<UploadOutcome> {
	if (!data.selectedDocumentId) {
		throw new Error("Seleccione un documento de la biblioteca");
	}

	const associationResponse = await apiClient.post<ApiEnvelope<DocumentRecord>>(
		`/documents/${data.selectedDocumentId}/associate`,
		buildAssociationPayload(data),
	);
	const selectedDocument = associationResponse.data;

	if (data.purpose === "support_document" || data.purpose === "library") {
		return { document: selectedDocument, ingest: null, mode: data.mode };
	}

	const ingestResponse = await apiClient.post<ApiEnvelope<IngestOutcome>>(
		`/documents/${data.selectedDocumentId}/ingest`,
		{
			purpose: data.purpose,
			mode: resolveIngestMode(data.purpose),
			targetStepCode: data.targetStepCode || undefined,
			linkedEntityType: data.serviceCaseId ? "service_case" : undefined,
			linkedEntityId: data.serviceCaseId || undefined,
		},
	);

	return { document: selectedDocument, ingest: ingestResponse.data, mode: data.mode };
}

async function handleUploadNewDocument(data: DocumentFormInput): Promise<UploadOutcome> {
	const formData = buildUploadFormData(data);
	const uploadResponse = await apiClient.post<ApiEnvelope<DocumentRecord>>("/documents", formData);
	const uploadedDocument = uploadResponse.data;

	if (data.purpose === "support_document") {
		return { document: uploadedDocument, ingest: null, mode: data.mode };
	}

	const ingestResponse = await apiClient.post<ApiEnvelope<IngestOutcome>>(
		`/documents/${uploadedDocument._id}/ingest`,
		{
			purpose: data.purpose,
			mode: resolveIngestMode(data.purpose),
			targetStepCode: data.targetStepCode || undefined,
			linkedEntityType: data.serviceCaseId ? "service_case" : undefined,
			linkedEntityId: data.serviceCaseId || undefined,
		},
	);

	return { document: uploadedDocument, ingest: ingestResponse.data, mode: data.mode };
}

function handleDocumentUploadSuccess({
	document,
	ingest,
	mode,
	onUploaded,
	router,
}: {
	document: DocumentRecord;
	ingest: IngestOutcome | null;
	mode: "upload" | "select";
	onUploaded?: (result: { document: DocumentRecord; ingest: IngestOutcome | null }) => void;
	router: ReturnType<typeof useRouter>;
}) {
	onUploaded?.({ document, ingest });

	if (ingest?.status === "template_draft_created" && ingest.draftId) {
		toast.success("Documento convertido en borrador editable");
		router.push(`/documents/ingestion/${ingest.draftId}`);
		return;
	}

	if (ingest?.status === "closing_evidence_routed") {
		toast.success(
			`Evidencia asociada a ${ingest.targetStepCode || ingest.classification || "revisión manual"}`,
		);
		return;
	}

	toast.success(
		mode === "select" ? "Documento vinculado correctamente" : "Documento subido correctamente",
	);
}

function useDocumentUploadMutation({
	onUploaded,
}: {
	onUploaded?: (result: { document: DocumentRecord; ingest: IngestOutcome | null }) => void;
}) {
	const qc = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: async (data: DocumentFormInput): Promise<UploadOutcome> =>
			data.mode === "select" ? handleSelectExistingDocument(data) : handleUploadNewDocument(data),
		onSuccess: ({ document, ingest, mode }) => {
			void qc.invalidateQueries({ queryKey: ["documents"] });
			void qc.invalidateQueries({ queryKey: ["service-cases"] });
			void qc.invalidateQueries({ queryKey: ["orders"] });
			void qc.invalidateQueries({ queryKey: ["planning-packets"] });
			void qc.invalidateQueries({ queryKey: ["execution-sessions"] });
			void qc.invalidateQueries({ queryKey: ["evidences"] });
			void qc.invalidateQueries({ queryKey: ["document-templates"] });
			handleDocumentUploadSuccess({ document, ingest, mode, onUploaded, router });
		},
		onError: (error: Error) => {
			toast.error(error.message ?? "Error al subir el documento");
		},
	});
}

function PurposeSelector({
	selectedPurpose,
	setValue,
}: {
	selectedPurpose: DocumentPurpose;
	setValue: UseFormSetValue<DocumentFormInput>;
}) {
	return (
		<div className="grid gap-3 md:grid-cols-3">
			{PURPOSE_OPTIONS.map((option) => {
				const Icon = option.icon;
				const isActive = selectedPurpose === option.value;

				return (
					<button
						key={option.value}
						type="button"
						onClick={() => setValue("purpose", option.value, { shouldValidate: true })}
						className={`rounded-xl border p-4 text-left transition-colors ${
							isActive
								? "border-brand bg-[var(--surface-elevated)]"
								: "border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:border-brand/50"
						}`}
					>
						<div className="flex items-center gap-2">
							<Icon className="size-4 text-brand" />
							<p className="text-sm font-bold text-[var(--text-primary)]">{option.label}</p>
						</div>
						<p className="mt-2 text-xs text-[var(--text-secondary)]">{option.description}</p>
					</button>
				);
			})}
		</div>
	);
}

function FileAndStepFields({
	errors,
	mode,
	onFileSelected,
	register,
	selectedFile,
}: {
	errors: FieldErrors<DocumentFormInput>;
	mode: DocumentUploaderMode;
	onFileSelected: (file: File) => void;
	register: UseFormRegister<DocumentFormInput>;
	selectedFile: File | undefined;
}) {
	return (
		<div className={`grid gap-4 ${mode === "upload" ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
			<div className="space-y-2">
				<label htmlFor="doc-step" className="block text-sm font-medium text-[var(--text-primary)]">
					Paso operativo objetivo
				</label>
				<select
					id="doc-step"
					{...register("targetStepCode")}
					className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
				>
					<option value="">Sugerencia automática / opcional</option>
					{CERMONT_OPERATIONAL_STEPS.map((step) => (
						<option key={step.code} value={step.code}>
							{step.stepNumber}. {step.label}
						</option>
					))}
				</select>
			</div>

			{mode === "upload" ? (
				<div className="space-y-2">
					<label
						htmlFor="doc-file"
						className="block text-sm font-medium text-[var(--text-primary)]"
					>
						Archivo
					</label>
					<input
						id="doc-file"
						name="file"
						type="file"
						accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (!file) {
								return;
							}

							onFileSelected(file);
						}}
						className="block w-full text-sm text-[var(--text-tertiary)] file:mr-4 file:rounded-md file:border-0 file:bg-[var(--surface-secondary)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--text-primary)] hover:file:bg-[var(--surface-elevated)]"
					/>
					{selectedFile && (
						<p className="text-xs text-[var(--text-tertiary)]">
							{(selectedFile.size / 1024).toFixed(1)} KB , {selectedFile.name}
						</p>
					)}
					{errors.file && <p className="text-xs text-brand-error">{errors.file.message}</p>}
				</div>
			) : null}
		</div>
	);
}

function OrderField({
	orders,
	register,
}: {
	orders: OrderOption[];
	register: UseFormRegister<DocumentFormInput>;
}) {
	return (
		<div className="space-y-2">
			<label htmlFor="doc-order" className="block text-sm font-medium text-[var(--text-primary)]">
				Orden de trabajo
			</label>
			<select
				id="doc-order"
				{...register("orderId")}
				className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
			>
				<option value="">Sin orden</option>
				{orders.map((order) => (
					<option key={order.id} value={order.id}>
						{getOrderLabel(order)}
					</option>
				))}
			</select>
		</div>
	);
}

function ServiceCaseField({
	defaultServiceCaseId,
	errors,
	register,
	selectedPurpose,
	serviceCases,
}: {
	defaultServiceCaseId?: string;
	errors: FieldErrors<DocumentFormInput>;
	register: UseFormRegister<DocumentFormInput>;
	selectedPurpose: DocumentPurpose;
	serviceCases?: ServiceCaseOption[];
}) {
	if (
		selectedPurpose !== "closing_evidence" &&
		!defaultServiceCaseId &&
		(!serviceCases || serviceCases.length === 0)
	) {
		return null;
	}

	return (
		<div className="space-y-4 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4">
			<div className="space-y-2">
				<label
					htmlFor="doc-service-case"
					className="block text-sm font-medium text-[var(--text-primary)]"
				>
					Caso de servicio
				</label>
				{serviceCases && serviceCases.length > 0 ? (
					<select
						id="doc-service-case"
						{...register("serviceCaseId")}
						className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
					>
						<option value="">Seleccione un caso</option>
						{serviceCases.map((serviceCase) => (
							<option key={serviceCase.id} value={serviceCase.id}>
								{serviceCase.code || serviceCase.id} {serviceCase.clientName || ""}
							</option>
						))}
					</select>
				) : (
					<input
						id="doc-service-case"
						type="text"
						{...register("serviceCaseId")}
						placeholder="ID del caso de servicio"
						className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
					/>
				)}
				{errors.serviceCaseId && (
					<p className="text-xs text-brand-error">{errors.serviceCaseId.message}</p>
				)}
			</div>
			<p className="text-xs text-(--text-secondary)">
				{selectedPurpose === "closing_evidence"
					? "Si no selecciona un paso, el backend intentará clasificar la evidencia por nombre de archivo y usted podrá corregirla subiéndola al paso correcto."
					: "Asociar el archivo al caso permite que el cockpit actualice bloqueadores y requisitos del paso correspondiente."}
			</p>
		</div>
	);
}

function SubmitButton({
	isPending,
	isSubmitting,
	mode,
}: {
	isPending: boolean;
	isSubmitting: boolean;
	mode: DocumentUploaderMode;
}) {
	return (
		<button
			type="submit"
			disabled={isSubmitting || isPending}
			className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
		>
			{isPending ? (
				<>
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					Procesando…
				</>
			) : (
				<>
					<Upload className="size-4" aria-hidden="true" />
					{mode === "select" ? "Vincular documento" : "Subir documento"}
				</>
			)}
		</button>
	);
}

export function DocumentUploader({
	defaultOrderId,
	defaultPurpose = "library",
	defaultServiceCaseId,
	defaultStepCode,
	onUploaded,
	orders,
	serviceCases,
	className,
	...rest
}: DocumentUploaderProps) {
	const defaultValues = createDefaultValues({
		defaultOrderId,
		defaultPurpose,
		defaultServiceCaseId,
		defaultStepCode,
	});

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<DocumentFormInput>({
		resolver: zodResolver(DocumentFormSchema),
		defaultValues,
	});

	const selectedPurpose = watch("purpose");
	const selectedFile = watch("file");
	const [isDragging, setIsDragging] = useState(false);
	const [mode, setMode] = useState<DocumentUploaderMode>("upload");
	const uploadMutation = useDocumentUploadMutation({ onUploaded });
	const { data: libraryDocuments, isLoading: isLoadingLibraryDocuments } = useLibraryDocuments();

	const handleFileSelected = useCallback(
		(file: File) => {
			applyFileSelection({ file, selectedPurpose, setValue, watch });
		},
		[selectedPurpose, setValue, watch],
	);

	return (
		<div className={`w-full ${className ?? ""}`} {...rest}>
			{/* Mode selector */}
			<div className="mb-4 flex gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1">
				<button
					type="button"
					onClick={() => {
						setMode("upload");
						setValue("mode", "upload", { shouldValidate: true });
						setValue("selectedDocumentId", "", { shouldValidate: false });
					}}
					className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						mode === "upload"
							? "bg-brand text-white"
							: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					}`}
				>
					Subir nuevo documento
				</button>
				<button
					type="button"
					onClick={() => {
						setMode("select");
						setValue("mode", "select", { shouldValidate: true });
					}}
					className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
						mode === "select"
							? "bg-brand text-white"
							: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					}`}
				>
					Seleccionar existente
				</button>
			</div>

			<form
				onSubmit={handleSubmit((data) => {
					uploadMutation.mutate(data, {
						onSuccess: () => {
							reset(defaultValues);
							setMode("upload");
						},
					});
				})}
				className="space-y-4"
			>
				<input type="hidden" {...register("mode")} />
				<fieldset
					className={`space-y-5 rounded-xl border bg-[var(--surface-primary)] p-4 transition-colors sm:p-6 ${
						isDragging
							? "border-brand bg-[var(--surface-secondary)]"
							: "border-[var(--border-subtle)]"
					}`}
					onDragOver={(event) => {
						event.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={(event) => {
						event.preventDefault();
						setIsDragging(false);
						const file = event.dataTransfer.files?.[0];
						if (file) {
							handleFileSelected(file);
						}
					}}
				>
					<legend className="flex items-center gap-2 px-2 text-sm font-semibold text-[var(--text-primary)]">
						<FileUp className="size-4" aria-hidden="true" />
						Subir documento
					</legend>

					<PurposeSelector selectedPurpose={selectedPurpose} setValue={setValue} />

					{mode === "select" && (
						<div className="space-y-2">
							<label
								htmlFor="library-doc-select"
								className="block text-sm font-medium text-[var(--text-primary)]"
							>
								Seleccionar documento de la biblioteca
							</label>
							{isLoadingLibraryDocuments ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="size-4 animate-spin text-[var(--text-tertiary)]" />
								</div>
							) : (
								<select
									id="library-doc-select"
									{...register("selectedDocumentId")}
									className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
									onChange={(e) => {
										setValue("selectedDocumentId", e.target.value, { shouldValidate: true });
										const selectedDoc = libraryDocuments?.find((doc) => doc._id === e.target.value);
										if (selectedDoc) {
											setValue("title", selectedDoc.title, { shouldValidate: true });
										}
									}}
								>
									<option value="">Seleccionar documento…</option>
									{libraryDocuments?.map((doc) => (
										<option key={doc._id} value={doc._id}>
											{doc.title}
										</option>
									))}
								</select>
							)}
							{errors.selectedDocumentId && (
								<p className="text-xs text-brand-error">{errors.selectedDocumentId.message}</p>
							)}
						</div>
					)}

					<div className="space-y-2">
						<label
							htmlFor="doc-title"
							className="block text-sm font-medium text-[var(--text-primary)]"
						>
							Título del documento
						</label>
						<input
							id="doc-title"
							type="text"
							{...register("title")}
							placeholder="Ej: Acta de entrega SES 2026-05"
							className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
						/>
						{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
					</div>

					<FileAndStepFields
						errors={errors}
						mode={mode}
						onFileSelected={handleFileSelected}
						register={register}
						selectedFile={selectedFile}
					/>

					{orders && orders.length > 0 ? <OrderField orders={orders} register={register} /> : null}

					<ServiceCaseField
						defaultServiceCaseId={defaultServiceCaseId}
						errors={errors}
						register={register}
						selectedPurpose={selectedPurpose}
						serviceCases={serviceCases}
					/>

					<SubmitButton
						isPending={uploadMutation.isPending}
						isSubmitting={isSubmitting}
						mode={mode}
					/>
				</fieldset>
			</form>
		</div>
	);
}
