"use client";

import { Check, LockKeyhole } from "lucide-react";
import { useState } from "react";

interface GateItem {
	id: string;
	label: string;
	isBlocking: boolean;
}

interface Props {
	gates: GateItem[];
	onComplete: (passedItems: string[]) => void;
}

export function PreflightGatesForm({ gates, onComplete }: Props) {
	const [checked, setChecked] = useState<Set<string>>(new Set());

	const toggle = (id: string) => {
		const next = new Set(checked);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		setChecked(next);
	};

	const blockingGates = gates.filter((g) => g.isBlocking);
	const allBlockingChecked = blockingGates.every((g) => checked.has(g.id));
	const checkedCount = checked.size;

	return (
		<div className="space-y-4">
			<p className="text-sm text-[var(--text-secondary)]">
				{checkedCount}/{gates.length} gates completados
			</p>

			<div className="grid gap-2">
				{gates.map((gate) => (
					<label
						key={gate.id}
						className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
							checked.has(gate.id)
								? "border-[#4CAF50] bg-[#4CAF50]/5"
								: "border-[var(--border-medium)] bg-[var(--surface-primary)]"
						}`}
					>
						<input
							type="checkbox"
							checked={checked.has(gate.id)}
							onChange={() => toggle(gate.id)}
							className="size-5 accent-[var(--color-brand-blue)]"
						/>
						<span className="flex-1 text-sm text-[var(--text-primary)]">{gate.label}</span>
						{gate.isBlocking && (
							<LockKeyhole className="size-4 text-amber-500" aria-label="Gate bloqueante" />
						)}
						{checked.has(gate.id) && <Check className="size-4 text-[#4CAF50]" aria-hidden="true" />}
					</label>
				))}
			</div>

			<button
				type="button"
				disabled={!allBlockingChecked}
				onClick={() => onComplete(Array.from(checked))}
				className="w-full rounded-full bg-[var(--color-brand-blue)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 transition"
			>
				Iniciar ejecución
			</button>
		</div>
	);
}
