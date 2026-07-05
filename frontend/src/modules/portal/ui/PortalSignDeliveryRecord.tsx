"use client";

import { DigitalSignaturePad } from "@/modules/reports/ui/DigitalSignaturePad";

interface Props {
	deliveryRecordId: string;
	onSign: (dataUrl: string) => void;
}

export function PortalSignDeliveryRecord({ deliveryRecordId, onSign }: Props) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
			<h2 className="text-sm font-semibold text-[var(--text-secondary)]">
				Firma del acta de entrega
			</h2>
			<p className="mt-1 text-xs text-[var(--text-tertiary)]">Acta #{deliveryRecordId.slice(-8)}</p>
			<div className="mt-4">
				<DigitalSignaturePad signerName="Cliente" title="Firma de aceptación" onSign={onSign} />
			</div>
		</div>
	);
}
