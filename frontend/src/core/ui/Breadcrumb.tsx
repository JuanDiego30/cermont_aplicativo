import Link from "next/link";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
	return (
		<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				return (
					<span key={item.label} className="inline-flex items-center gap-1.5">
						{index > 0 && (
							<span className="text-[var(--text-muted)]" aria-hidden="true">/</span>
						)}
						{isLast || !item.href ? (
							<span
								aria-current={isLast ? "page" : undefined}
								className={isLast ? "font-medium text-[var(--text-primary)]" : ""}
							>
								{item.label}
							</span>
						) : (
							<Link
								href={item.href}
								className="transition-colors hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)] rounded-sm"
							>
								{item.label}
							</Link>
						)}
					</span>
				);
			})}
		</nav>
	);
}
