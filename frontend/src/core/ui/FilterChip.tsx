"use client";

import { X } from "lucide-react";
import Link from "next/link";

interface FilterChipProps {
	searchParams: string[];
	paramKey: string;
	label: string;
	navHref: string;
}

export function FilterChip({ label, navHref }: FilterChipProps) {
	return (
		<Link
			href={navHref}
			className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-blue)]/10 px-3 py-1 text-sm font-medium text-[var(--color-brand-blue)] transition-colors hover:bg-[var(--color-brand-blue)]/20"
		>
			<span>{label}</span>
			<X className="size-3.5" aria-hidden="true" />
		</Link>
	);
}
