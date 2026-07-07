"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useReducer } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { usePortalOrderDetail, useSignDeliveryRecord } from "@/modules/portal/api/portal-api";
import { SignaturePad } from "@/modules/signatures/ui/SignaturePad";

type FormDocType = "CC" | "CE" | "NIT" | "PASAPORTE";
type CaptureMethod = "canvas_touch" | "canvas_mouse";

interface SignFormState {
	signerName: string;
	signerDocType: FormDocType;
	signerDocNumber: string;
	signatureData: string;
	captureMethod: CaptureMethod;
}

type SignFormAction =
	| { type: "SET_SIGNER_NAME"; payload: string }
	| { type: "SET_SIGNER_DOC_TYPE"; payload: FormDocType }
	| { type: "SET_SIGNER_DOC_NUMBER"; payload: string }
	| { type: "SET_SIGNATURE_DATA"; payload: string }
	| { type: "SET_CAPTURE_METHOD"; payload: CaptureMethod };

const INITIAL_FORM_STATE: SignFormState = {
	signerName: "",
	signerDocType: "CC",
	signerDocNumber: "",
	signatureData: "",
	captureMethod: "canvas_mouse",
};

function signFormReducer(state: SignFormState, action: SignFormAction): SignFormState {
	switch (action.type) {
		case "SET_SIGNER_NAME":
			return { ...state, signerName: action.payload };
		case "SET_SIGNER_DOC_TYPE":
			return { ...state, signerDocType: action.payload };
		case "SET_SIGNER_DOC_NUMBER":
			return { ...state, signerDocNumber: action.payload };
		case "SET_SIGNATURE_DATA":
			return { ...state, signatureData: action.payload };
		case "SET_CAPTURE_METHOD":
			return { ...state, captureMethod: action.payload };
	}
}

export default function PortalSignaturePage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [form, dispatch] = useReducer(signFormReducer, INITIAL_FORM_STATE);

	// Load the order to find the delivery record context
	const { data: order, isLoading } = usePortalOrderDetail(id);

	const signMutation = useSignDeliveryRecord({
		onSuccess: () => {
			toast.success("Acta firmada exitosamente");
			router.push(`/portal/orders/${id}`);
		},
		onError: (error) => {
			toast.error(error.message ?? "Error al firmar el acta. Intente nuevamente.");
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<Loader2
					className="size-8 animate-spin text-[var(--color-brand-blue)]"
					aria-hidden="true"
				/>
			</div>
		);
	}

	const pendingDeliveryRecords = (order?.deliveryRecords ?? []).filter(
		(dr) => dr.status === "sent" || dr.status === "draft",
	);

	const handleSubmit = async () => {
		if (!form.signerName.trim()) {
			toast.error("Ingrese el nombre del firmante");
			return;
		}
		if (!form.signatureData) {
			toast.error("Capture la firma en el recuadro");
			return;
		}

		for (const dr of pendingDeliveryRecords) {
			signMutation.mutate({
				deliveryRecordId: dr._id,
				clientName: form.signerName.trim(),
				clientDocumentType: form.signerDocType,
				clientDocumentNumber: form.signerDocNumber.trim() || undefined,
				captureMethod: form.captureMethod,
				imageData: form.signatureData.replace(/^data:image\/png;base64,/, ""),
			});
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<Link
				href={`/portal/orders/${id}`}
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver a la orden
			</Link>

			<div>
				<h1 className="text-xl font-semibold text-[var(--text-primary)]">
					Firma de acta de entrega
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					{order?.code} — {pendingDeliveryRecords.length} acta(s) pendiente(s) de firma
				</p>
			</div>

			<div className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
				{/* Client Information */}
				<fieldset>
					<legend className="text-sm font-medium text-[var(--text-primary)]">
						Información del firmante
					</legend>
					<div className="mt-3 space-y-4">
						<div>
							<label
								htmlFor="signer-name"
								className="block text-sm font-medium text-[var(--text-secondary)]"
							>
								Nombre completo *
							</label>
							<input
								id="signer-name"
								type="text"
								value={form.signerName}
								onChange={(e) => dispatch({ type: "SET_SIGNER_NAME", payload: e.target.value })}
								className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
								placeholder="Nombre de quien firma"
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="signer-doc-type"
									className="block text-sm font-medium text-[var(--text-secondary)]"
								>
									Tipo de documento
								</label>
								<select
									id="signer-doc-type"
									value={form.signerDocType}
									onChange={(e) =>
										dispatch({
											type: "SET_SIGNER_DOC_TYPE",
											payload: e.target.value as FormDocType,
										})
									}
									className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
								>
									<option value="CC">Cédula de Ciudadanía</option>
									<option value="CE">Cédula de Extranjería</option>
									<option value="NIT">NIT</option>
									<option value="PASAPORTE">Pasaporte</option>
								</select>
							</div>
							<div>
								<label
									htmlFor="signer-doc-number"
									className="block text-sm font-medium text-[var(--text-secondary)]"
								>
									Número de documento
								</label>
								<input
									id="signer-doc-number"
									type="text"
									value={form.signerDocNumber}
									onChange={(e) =>
										dispatch({ type: "SET_SIGNER_DOC_NUMBER", payload: e.target.value })
									}
									className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
									placeholder="Opcional"
								/>
							</div>
						</div>
					</div>
				</fieldset>

				{/* Signature Capture */}
				<fieldset>
					<legend className="text-sm font-medium text-[var(--text-primary)]">Firma digital</legend>
					<p className="mt-1 text-xs text-[var(--text-tertiary)]">
						Dibuje su firma en el recuadro usando el mouse o touch.
					</p>
					<div className="mt-3">
						<SignaturePad
							onChange={(dataUrl: string, method?: string) => {
								dispatch({ type: "SET_SIGNATURE_DATA", payload: dataUrl });
								if (method) {
									dispatch({ type: "SET_CAPTURE_METHOD", payload: method as CaptureMethod });
								}
							}}
							height={180}
						/>
					</div>
					{form.signatureData && (
						<p className="mt-2 text-xs text-[var(--color-success)]">
							✓ Firma capturada correctamente
						</p>
					)}
				</fieldset>
			</div>

			<div className="flex items-center justify-end gap-3">
				<Button type="button" variant="outline" onClick={() => router.push(`/portal/orders/${id}`)}>
					Cancelar
				</Button>
				<Button
					type="button"
					disabled={!form.signerName.trim() || !form.signatureData || signMutation.isPending}
					onClick={handleSubmit}
				>
					{signMutation.isPending ? "Firmando..." : "Firmar acta"}
				</Button>
			</div>
		</div>
	);
}
