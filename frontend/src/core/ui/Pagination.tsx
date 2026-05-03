"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/_shared/lib/utils";

export interface PaginationProps {
	page: number;
	limit: number;
	total: number;
	onPageChange: (page: number) => void;
	className?: string;
}

type PageItem = {
	key: string;
	value: number | "ellipsis";
};

export function Pagination({ page, limit, total, onPageChange, className }: PaginationProps) {
	const totalPages = Math.ceil(total / limit);
	const hasNextPage = page < totalPages;
	const hasPrevPage = page > 1;

	const getPageItems = (): PageItem[] => {
		const pages: PageItem[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push({ key: `page-${i}`, value: i });
			}
		} else {
			pages.push({ key: "page-1", value: 1 });

			if (page > 3) {
				pages.push({ key: "ellipsis-start", value: "ellipsis" });
			}

			const start = Math.max(2, page - 1);
			const end = Math.min(totalPages - 1, page + 1);

			for (let i = start; i <= end; i++) {
				pages.push({ key: `page-${i}`, value: i });
			}

			if (page < totalPages - 2) {
				pages.push({ key: "ellipsis-end", value: "ellipsis" });
			}

			pages.push({ key: `page-${totalPages}`, value: totalPages });
		}

		return pages;
	};

	if (totalPages <= 1) {
		return null;
	}

	return (
		<nav
			aria-label="Pagination"
			className={cn("flex items-center justify-between gap-4", className)}
		>
			<div className="text-sm text-[var(--text-secondary)]">
				Página <span className="font-semibold">{page}</span> de{" "}
				<span className="font-semibold">{totalPages}</span> ({total} resultados)
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => onPageChange(page - 1)}
					disabled={!hasPrevPage}
					aria-label="Previous page"
					className={cn(
						"inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition",
						"border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)]",
						"hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue)]/20",
						"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--surface-primary)] disabled:hover:text-[var(--text-secondary)]",
					)}
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline">Anterior</span>
				</button>

				<div className="hidden sm:flex items-center gap-1">
					{getPageItems().map((pageItem) =>
						pageItem.value === "ellipsis" ? (
							<span key={pageItem.key} className="px-2 py-2 text-[var(--text-tertiary)]">
								...
							</span>
						) : (
							<button
								key={pageItem.key}
								type="button"
								onClick={() => onPageChange(pageItem.value as number)}
								aria-label={`Go to page ${pageItem.value}`}
								aria-current={pageItem.value === page ? "page" : undefined}
								className={cn(
									"min-h-11 min-w-11 rounded-lg px-3 py-2 text-sm font-medium transition",
									"border border-[var(--border-default)]",
									"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue)]/20",
									pageItem.value === page
										? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)] text-[var(--text-inverse)]"
										: "bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",
								)}
							>
								{pageItem.value}
							</button>
						),
					)}
				</div>

				<button
					type="button"
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNextPage}
					aria-label="Next page"
					className={cn(
						"inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition",
						"border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)]",
						"hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-blue)]/20",
						"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--surface-primary)] disabled:hover:text-[var(--text-secondary)]",
					)}
				>
					<span className="hidden sm:inline">Siguiente</span>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</nav>
	);
}
