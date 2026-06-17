"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { apiClient } from "@/lib/http/api-client";
import { captureClientSignature } from "@/modules/signatures/api/signatures-api";
import { SignaturePad } from "@/modules/signatures/ui/SignaturePad";

type SignaturePageProps = {
	params: Promise<{ id: string }>;
};

export default function SignaturePage({ params }: SignaturePageProps) {
	const { id } = use(params);
	if (!id) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-brand-error">Falta ID del acta</h1>
			</div>
		);
	}
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center py-24">
					<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
				</div>
			}
		>
			<SignaturePageContent id={id} />
		</Suspense>
	);
}

function SignaturePageContent({ id }: { id: string }) {
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";

	const { data: deliveryRecord, isLoading } = useQuery({
		queryKey: ["delivery-record", id],
		queryFn: async () => {
			const res = await apiClient.get<{ success: boolean; data: Record<string, unknown> }>(
				`/delivery-records/${id}`,
			);
			return res.data;
		},
		enabled: Boolean(id),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
			</div>
		);
	}

	return (
		<SignaturePageForm
			id={id}
			serviceCaseId={serviceCaseId}
			deliveryRecord={deliveryRecord as Record<string, unknown> | undefined}
		/>
	);
}

function SignaturePageForm({
	id,
	serviceCaseId,
	deliveryRecord,
}: {
	id: string;
	serviceCaseId: string;
	deliveryRecord?: Record<string, unknown>;
}) {
	const { push } = useRouter();
	const [isSigning, setIsSigning] = useState(false);
	const [signerName, setSignerName] = useState("");
	const [signatureData, setSignatureData] = useState("");
	const [captureMethod, setCaptureMethod] = useState<"canvas_touch" | "canvas_mouse">(
		"canvas_mouse",
	);

	const handleSignClient = async () => {
		if (!signerName.trim()) {
			toast.error("Ingresa el nombre de quien firma");
			return;
		}
		if (!signatureData) {
			toast.error("Captura la firma en el recuadro");
			return;
		}
		setIsSigning(true);
		const signedAt = new Date().toISOString();
		try {
			await captureClientSignature({
				clientName: signerName.trim(),
				contextType: "delivery_record",
				contextId: id,
				captureMethod,
				imageData: signatureData,
				clientMutationId: crypto.randomUUID(),
			});

			const res = await apiClient.post<{ success: boolean; error?: string }>(
				`/delivery-records/${id}/sign`,
				{
					acceptanceStatus: "accepted",
					signatureMethod: "digital",
					signedAt,
				},
			);
			if (res.success) {
				toast.success("Firma registrada exitosamente");
				push(`/service-cases/${serviceCaseId || ""}`);
			} else {
				toast.error(res.error || "Error al registrar firma");
			}
		} catch {
			toast.error("Error de conexión");
		} finally {
			setIsSigning(false);
		}
	};

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
			<Link
				href={`/service-cases/${serviceCaseId || "#"}`}
				className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				<ArrowLeft className="size-4" /> Volver al cockpit
			</Link>
			<div className="mb-8 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<p className="text-sm font-medium text-[var(--color-brand)]">Paso 9 / Firma del cliente</p>
				<h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
					Registrar firma del cliente
				</h1>
				{deliveryRecord && (
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Acta: {String(deliveryRecord.code || deliveryRecord._id || id)}
					</p>
				)}
			</div>
			<div className="space-y-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="space-y-1">
					<label htmlFor="signer-name" className="text-sm font-medium text-[var(--text-primary)]">
						Nombre de quien firma
					</label>
					<input
						id="signer-name"
						value={signerName}
						onChange={(e) => setSignerName(e.target.value)}
						placeholder="Nombre y apellido del representante del cliente"
						className="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
					/>
				</div>

				<SignaturePad
					onChange={(dataUrl, method) => {
						setSignatureData(dataUrl);
						setCaptureMethod(method);
					}}
				/>

				<div className="flex flex-col items-center gap-3">
					<p className="text-xs text-[var(--text-tertiary)]">
						La firma se almacena con sello de tiempo, hash y metadatos para su verificación.
					</p>
					<Button loading={isSigning} onClick={handleSignClient}>
						Registrar firma del cliente
					</Button>
				</div>
			</div>
		</div>
	);
}
