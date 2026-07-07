"use client";

import {
	EvidenceSlotCard,
	type EvidenceSlotPreview,
	type EvidenceSlotStatus,
} from "../EvidenceSlotCard";

interface EvidenceSlot {
	id: string;
	phase: "before" | "during" | "after";
	label: string;
	isRequired: boolean;
	isBlocking: boolean;
	thumbnailUrl?: string;
	status: "empty" | "uploading" | "uploaded" | "error";
	onCapture: () => void;
}

interface Props {
	slots: EvidenceSlot[];
}

function resolvePreview(thumbnailUrl?: string): EvidenceSlotPreview {
	return thumbnailUrl ? { status: "present", url: thumbnailUrl } : { status: "absent" };
}

function resolveStatus(status: EvidenceSlot["status"]): EvidenceSlotStatus {
	return status;
}

export function StructuredEvidenceCapture({ slots }: Props) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{slots.map((slot) => (
				<EvidenceSlotCard
					key={slot.id}
					label={slot.label}
					phase={slot.phase}
					isRequired={slot.isRequired}
					isBlocking={slot.isBlocking}
					status={resolveStatus(slot.status)}
					preview={resolvePreview(slot.thumbnailUrl)}
					onCapture={slot.onCapture}
				/>
			))}
		</div>
	);
}
