"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { CERMONT_GUIDE_EVENT } from "./CermontGuideProvider";
import { getTourForPath } from "./tours";

export function GuideButton() {
	const pathname = usePathname() ?? "";
	const hasTour = Boolean(getTourForPath(pathname));

	if (!hasTour) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={() => window.dispatchEvent(new Event(CERMONT_GUIDE_EVENT))}
			aria-label="Explain this page"
			className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
		>
			<Sparkles className="h-4 w-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
			<span className="hidden md:inline">Explain this page</span>
			<span className="md:hidden">Help</span>
		</button>
	);
}
