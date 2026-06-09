"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { apiClient } from "@/lib/http/api-client";

type SignaturePageProps = {
	params: Promise<{ id: string }>;
};

export default function SignaturePage({ params }: SignaturePageProps) {
	const { id } = use(params);
	const { push } = useRouter();
	const searchParams = useSearchParams();
	const serviceCaseId = searchParams.get("serviceCaseId") ?? "";
	const [isSigning, setIsSigning] = useState(false);

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

	if (!id) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-12 text-center">
				<h1 className="text-xl font-semibold text-red-600">Falta ID del acta</h1>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
			</div>
		);
	}

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
			<div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<p className="mb-4 text-sm text-[var(--text-secondary)]">
						Confirma que el cliente ha firmado el acta de entrega para avanzar al paso de SES/Ariba.
					</p>
					<Button
						loading={isSigning}
						onClick={async () => {
							setIsSigning(true);
							try {
								const res = await apiClient.post<{ success: boolean; error?: string }>(
									`/delivery-records/${id}/sign`,
									{
										acceptanceStatus: "accepted",
										signatureMethod: "digital",
										signedAt: new Date().toISOString(),
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
						}}
					>
						Registrar firma del cliente
					</Button>
				</div>
			</div>
		</div>
	);
}
