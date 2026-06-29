"use client";

import { SUPERVISORY_ROLES } from "@cermont/domain";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Download, FileText, Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/core/ui/Button";
import { Skeleton } from "@/core/ui/Skeleton";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";
import { apiClient } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { EvidenceApprovalPanel } from "@/modules/evidences/ui/EvidenceApprovalPanel";

const SUPERVISORY_ROLE_LIST: readonly string[] = SUPERVISORY_ROLES;

export default function EvidenceDetailPage() {
	const { id } = useParams<{ id: string }>();
	const isOnline = useOnlineStatus();
	const { user } = useAuth();

	const {
		data: evidence,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["evidence", id],
		queryFn: async () => {
			const result = await apiClient.get<{ success: boolean; data: EvidenceDetail }>(
				`/evidences/${id}`,
			);
			return result.data;
		},
		enabled: !!id,
	});

	const downloadMutation = useMutation({
		mutationFn: async () => {
			const result = await apiClient.post<{
				success: boolean;
				data: { url: string; filename: string };
			}>(`/evidences/${id}/download`, {});
			return result.data;
		},
		onSuccess: (data) => {
			window.open(data.url, "_blank");
			toast.success("Descargando evidencia");
		},
		onError: () => {
			toast.error("Error al descargar la evidencia");
		},
	});

	if (isLoading) {
		return (
			<section className="space-y-4" aria-label="Cargando evidencia">
				<Skeleton variant="text" />
				<Skeleton variant="chart" height={300} />
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton variant="text" />
					<Skeleton variant="text" />
				</div>
			</section>
		);
	}

	if (error || !evidence) {
		return (
			<section className="space-y-4">
				<Link
					href="/evidences"
					className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver a evidencias
				</Link>
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)]">
					No se pudo cargar la evidencia.
				</div>
			</section>
		);
	}

	const canVerify = !!user?.role && SUPERVISORY_ROLE_LIST.includes(user.role);

	return (
		<section className="space-y-6" aria-labelledby="evidence-title">
			<Link
				href="/evidences"
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a evidencias
			</Link>

			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 id="evidence-title" className="text-xl font-semibold text-[var(--text-primary)]">
						{evidence.title || evidence.filename}
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{evidence.description || "Sin descripción"}
					</p>
					{evidence.verificationStatus && (
						<div
							className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
								evidence.verificationStatus === "approved"
									? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
									: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
							}`}
						>
							{evidence.verificationStatus === "approved" ? (
								<CheckCircle2 className="size-3.5" aria-hidden="true" />
							) : (
								<XCircle className="size-3.5" aria-hidden="true" />
							)}
							{evidence.verificationStatus === "approved" ? "Aprobada" : "Rechazada"}
						</div>
					)}
				</div>
				{isOnline && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => downloadMutation.mutate()}
						disabled={downloadMutation.isPending}
					>
						{downloadMutation.isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden="true" />
						) : (
							<Download className="size-4" aria-hidden="true" />
						)}
						Descargar PDF
					</Button>
				)}
			</header>

			<div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
				{evidence.url ? (
					<Image
						src={evidence.url}
						alt={evidence.title || "Evidencia"}
						fill
						className="object-contain"
						sizes="(max-width: 768px) 100vw, 800px"
						unoptimized
					/>
				) : (
					<div className="flex h-full items-center justify-center text-[var(--text-tertiary)]">
						<FileText className="size-12" aria-hidden="true" />
					</div>
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<InfoCard label="Archivo" value={evidence.filename} />
				<InfoCard label="Tamaño" value={`${(evidence.sizeBytes / 1024).toFixed(1)} KB`} />
				<InfoCard label="Tipo" value={evidence.mimeType} />
				{evidence.capturedAt && (
					<InfoCard
						label="Capturada"
						value={new Date(evidence.capturedAt).toLocaleString("es-CO")}
					/>
				)}
				{evidence.uploadedAt && (
					<InfoCard label="Subida" value={new Date(evidence.uploadedAt).toLocaleString("es-CO")} />
				)}
			</div>

			{evidence.verificationComment && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
					<p className="text-xs text-[var(--text-tertiary)]">Comentario de verificación</p>
					<p className="mt-1 text-sm text-[var(--text-primary)]">{evidence.verificationComment}</p>
				</div>
			)}

			{canVerify && <EvidenceApprovalPanel evidenceId={evidence._id} />}
		</section>
	);
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<p className="text-xs text-[var(--text-tertiary)]">{label}</p>
			<p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{value}</p>
		</div>
	);
}

interface EvidenceDetail {
	_id: string;
	url: string;
	filename: string;
	mimeType: string;
	sizeBytes: number;
	title?: string;
	description?: string;
	capturedAt?: string;
	uploadedAt?: string;
	verificationStatus?: "approved" | "rejected";
	verificationComment?: string;
}
