"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FileWarning, Inbox, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/core/ui/Button";
import { useReportPipeline } from "@/reports/queries";
import { ApprovalActionBar } from "./ApprovalActionBar";
import { PdfPreviewPanel } from "./PdfPreviewPanel";
import { PipelineItemCard } from "./PipelineItemCard";

export function ApprovalInbox() {
	const { data, isLoading, isError, error, refetch } = useReportPipeline();
	const pipeline = data?.pipeline ?? [];
	const [selectedId, setSelectedId] = useState("");
	const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

	const activeSelectedId = selectedId || pipeline[0]?._id || "";
	const selectedItem = useMemo(
		() => pipeline.find((item) => item._id === activeSelectedId) ?? pipeline[0] ?? null,
		[pipeline, activeSelectedId],
	);

	const handleSelect = (itemId: string) => {
		setSelectedId(itemId);
		setMobileDetailOpen(true);
	};

	const handleActionComplete = () => {
		const currentIndex = pipeline.findIndex((item) => item._id === activeSelectedId);
		const nextItem = pipeline[currentIndex + 1] ?? pipeline[0];
		setSelectedId(nextItem?._id ?? "");
		setMobileDetailOpen(Boolean(nextItem));
		void refetch();
	};

	if (isLoading) {
		return (
			<section
				aria-busy="true"
				aria-label="Cargando bandeja de aprobación"
				className="flex h-96 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]"
			>
				<Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-blue)]" />
			</section>
		);
	}

	if (isError) {
		return (
			<section className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-danger)]/20 bg-[var(--surface-primary)] py-16 text-center">
				<FileWarning className="h-10 w-10 text-[var(--color-danger)]" aria-hidden="true" />
				<p className="text-sm text-[var(--color-danger)]">
					{error instanceof Error ? error.message : "No se pudo cargar la bandeja"}
				</p>
				<Button type="button" variant="outline" onClick={() => refetch()}>
					Reintentar
				</Button>
			</section>
		);
	}

	if (pipeline.length === 0) {
		return (
			<section className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] py-16 text-center">
				<Inbox className="h-10 w-10 text-[var(--text-tertiary)]" aria-hidden="true" />
				<p className="text-sm text-[var(--text-secondary)]">
					No hay informes pendientes de revisión.
				</p>
			</section>
		);
	}

	return (
		<section
			className="grid min-h-[680px] gap-4 lg:grid-cols-[minmax(320px,40%)_minmax(0,60%)]"
			aria-label="Bandeja de aprobación"
		>
			<aside className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-3">
				<div className="flex items-center justify-between px-1 pb-3">
					<div>
						<h2 className="text-sm font-bold text-[var(--text-primary)]">Pendientes de revisión</h2>
						<p className="text-xs text-[var(--text-secondary)]">
							{pipeline.length} órdenes listas para aprobación
						</p>
					</div>
				</div>
				<div className="space-y-2 overflow-y-auto pr-1 lg:max-h-[610px]">
					{pipeline.map((item) => (
						<PipelineItemCard
							key={item._id}
							item={item}
							isSelected={activeSelectedId === item._id}
							onSelect={() => handleSelect(item._id)}
						/>
					))}
				</div>
			</aside>

			<div className="hidden min-h-0 flex-col gap-4 lg:flex">
				{selectedItem ? (
					<>
						<div className="min-h-0 flex-1">
							<PdfPreviewPanel
								orderId={selectedItem._id}
								pdfUrl={selectedItem.pdfUrl}
								reportSummary={selectedItem.reportSummary}
							/>
						</div>
						<ApprovalActionBar orderId={selectedItem._id} onActionComplete={handleActionComplete} />
					</>
				) : null}
			</div>

			<Dialog.Root open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 lg:hidden" />
					<Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)] focus:outline-none lg:hidden">
						<Dialog.Title className="text-base font-bold text-[var(--text-primary)]">
							Revisión de informe
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-[var(--text-secondary)]">
							Previsualiza el PDF y registra la decisión de aprobación.
						</Dialog.Description>
						<Dialog.Close className="absolute right-4 top-4 rounded-[var(--radius-md)] p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]">
							<X className="h-5 w-5" aria-hidden="true" />
							<span className="sr-only">Cerrar</span>
						</Dialog.Close>
						{selectedItem ? (
							<div className="mt-4 space-y-4">
								<div className="h-[58vh] min-h-[420px]">
									<PdfPreviewPanel
										orderId={selectedItem._id}
										pdfUrl={selectedItem.pdfUrl}
										reportSummary={selectedItem.reportSummary}
									/>
								</div>
								<ApprovalActionBar
									orderId={selectedItem._id}
									onActionComplete={handleActionComplete}
								/>
							</div>
						) : null}
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</section>
	);
}
