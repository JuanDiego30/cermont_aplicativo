"use client";

import {
	CERMONT_OPERATIONAL_STEPS,
	type CermontOperationalStepCode,
	type DocumentPurpose,
} from "@cermont/shared-types";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/core/ui/Button";
import { useOrders } from "@/modules/orders/queries";
import { useServiceCaseList } from "@/modules/service-cases/queries";
import { DocumentUploader } from "./DocumentUploader";

interface ContextualDocumentUploadModalProps {
	children: ReactNode;
	defaultOrderId?: string;
	defaultPurpose?: DocumentPurpose;
	defaultServiceCaseId?: string;
	defaultStepCode?: CermontOperationalStepCode;
	description?: string;
	title?: string;
}

function resolveStepLabel(stepCode: CermontOperationalStepCode | undefined): string {
	if (!stepCode) {
		return "Sin paso preseleccionado";
	}

	const step = CERMONT_OPERATIONAL_STEPS.find((currentStep) => currentStep.code === stepCode);
	if (!step) {
		return stepCode;
	}

	return `Paso ${step.stepNumber} · ${step.label}`;
}

export function ContextualDocumentUploadModal({
	children,
	defaultOrderId,
	defaultPurpose = "support_document",
	defaultServiceCaseId,
	defaultStepCode,
	description = "Vincula el archivo al caso, orden y paso operativo correctos para actualizar bloqueadores, plantillas y soportes del workflow.",
	title = "Carga documental contextual",
}: ContextualDocumentUploadModalProps) {
	const [open, setOpen] = useState(false);
	const { data: ordersResult, isLoading: isLoadingOrders } = useOrders({ limit: 100 });
	const { data: serviceCasesResult, isLoading: isLoadingServiceCases } = useServiceCaseList();

	const orders =
		ordersResult?.items.map((order) => ({
			id: order._id,
			code: order.code,
			assetName: order.assetName,
			location: order.location,
		})) ?? [];

	const serviceCases =
		serviceCasesResult?.items.map((serviceCase) => ({
			id: serviceCase._id,
			code: serviceCase.code,
			clientName: serviceCase.clientName,
		})) ?? [];

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--surface-overlay)] backdrop-blur-sm" />
				<Dialog.Content
					aria-labelledby="contextual-upload-dialog-title"
					className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-modal)]"
				>
					<div className="border-b border-[var(--border-subtle)] px-6 py-5">
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-2">
								<Dialog.Title
									id="contextual-upload-dialog-title"
									className="text-lg font-semibold text-[var(--text-primary)]"
								>
									{title}
								</Dialog.Title>
								<Dialog.Description className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
									{description}
								</Dialog.Description>
								<div className="flex flex-wrap gap-2 text-xs">
									<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1 text-[var(--text-secondary)]">
										{resolveStepLabel(defaultStepCode)}
									</span>
									{defaultServiceCaseId ? (
										<span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] px-3 py-1 text-[var(--color-brand)]">
											Caso: {defaultServiceCaseId}
										</span>
									) : null}
									{defaultOrderId ? (
										<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1 text-[var(--text-secondary)]">
											OT: {defaultOrderId}
										</span>
									) : null}
								</div>
							</div>
							<Dialog.Close asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="rounded-full"
									aria-label="Cerrar modal de carga contextual"
								>
									<X className="size-4" />
								</Button>
							</Dialog.Close>
						</div>
					</div>

					<div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-5">
						{isLoadingOrders || isLoadingServiceCases ? (
							<div className="flex min-h-48 items-center justify-center">
								<Loader2 className="size-5 animate-spin text-[var(--color-brand)]" />
							</div>
						) : (
							<DocumentUploader
								defaultOrderId={defaultOrderId}
								defaultPurpose={defaultPurpose}
								defaultServiceCaseId={defaultServiceCaseId}
								defaultStepCode={defaultStepCode}
								orders={orders}
								serviceCases={serviceCases}
								onUploaded={() => setOpen(false)}
							/>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
