"use client";

import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { cn } from "@/_shared/lib/utils";

interface OrderViewToggleProps {
	view: "list" | "kanban";
	listHref: string;
	kanbanHref: string;
}

export function OrderViewToggle({ view, listHref, kanbanHref }: OrderViewToggleProps) {
	return (
		<nav className="grid min-h-11 min-w-0 grid-cols-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-1">
			<Link
				href={listHref}
				aria-current={view === "list" ? "page" : undefined}
				className={cn(
					"inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition",
					view === "list"
						? "bg-[var(--color-brand-blue)] text-[var(--text-inverse)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]",
				)}
			>
				<List className="h-4 w-4" aria-hidden="true" />
				Lista
			</Link>
			<Link
				href={kanbanHref}
				aria-current={view === "kanban" ? "page" : undefined}
				className={cn(
					"inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition",
					view === "kanban"
						? "bg-[var(--color-brand-blue)] text-[var(--text-inverse)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]",
				)}
			>
				<LayoutGrid className="h-4 w-4" aria-hidden="true" />
				Kanban
			</Link>
		</nav>
	);
}
