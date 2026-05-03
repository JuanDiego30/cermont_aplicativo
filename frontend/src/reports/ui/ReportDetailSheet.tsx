"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReportPanel } from "@/reports/ui/ReportPanel";

interface ReportDetailSheetProps {
	orderId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ReportDetailSheet({ orderId, open, onOpenChange }: ReportDetailSheetProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
				<Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-2)] focus:outline-none sm:p-6">
					<Dialog.Title className="sr-only">Detalle del informe</Dialog.Title>
					<Dialog.Description className="sr-only">
						Panel lateral con el estado, resumen y acciones del informe seleccionado.
					</Dialog.Description>
					<Dialog.Close className="absolute right-4 top-4 rounded-[var(--radius-md)] p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]">
						<X className="h-5 w-5" aria-hidden="true" />
						<span className="sr-only">Cerrar</span>
					</Dialog.Close>
					{orderId && <ReportPanel orderId={orderId} />}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
