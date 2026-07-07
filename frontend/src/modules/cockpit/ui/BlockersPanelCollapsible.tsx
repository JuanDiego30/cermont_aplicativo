"use client";

import { AlertTriangle, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Blocker } from "../model/cockpit.types";

interface Props {
	blockers: Blocker[];
}

export function BlockersPanelCollapsible({ blockers }: Props) {
	const [isOpen, setIsOpen] = useState(blockers.length > 0);

	if (blockers.length === 0) {
		return null;
	}

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)]">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between px-5 py-4 text-left"
				aria-expanded={isOpen}
			>
				<span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
					<AlertTriangle className="size-4 text-[#F44336]" aria-hidden="true" />
					{blockers.length} bloqueo{blockers.length !== 1 ? "s" : ""} detectado
					{blockers.length !== 1 ? "s" : ""}
				</span>
				{isOpen ? (
					<ChevronUp className="size-4 text-[var(--text-secondary)]" aria-hidden="true" />
				) : (
					<ChevronDown className="size-4 text-[var(--text-secondary)]" aria-hidden="true" />
				)}
			</button>

			{isOpen && (
				<ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] px-5 pb-4">
					{blockers.map((blocker) => (
						<li key={blocker.code} className="flex items-start gap-3 py-3">
							{blocker.severity === "error" ? (
								<XCircle className="mt-0.5 size-4 shrink-0 text-[#F44336]" aria-hidden="true" />
							) : (
								<AlertTriangle
									className="mt-0.5 size-4 shrink-0 text-amber-500"
									aria-hidden="true"
								/>
							)}
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-[var(--text-primary)]">{blocker.message}</p>
								<p className="mt-0.5 font-mono text-xs text-[var(--text-secondary)]">
									{blocker.code}
								</p>
							</div>
							{blocker.moduleLink && (
								<Link
									href={blocker.moduleLink}
									className="shrink-0 text-xs font-medium text-[var(--color-brand-blue)] hover:underline"
								>
									Ver detalle
								</Link>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
