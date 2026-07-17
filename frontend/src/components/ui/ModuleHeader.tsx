import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { AppIcon } from "./AppIcon";

interface ModuleHeaderProps {
	stepBadge?: string; // e.g. "Paso 2 / Operación"
	title: string;
	description: string;
	primaryAction?: {
		label: string;
		href?: string;
		onClick?: () => void;
		icon?: LucideIcon;
	};
}

export function ModuleHeader({ stepBadge, title, description, primaryAction }: ModuleHeaderProps) {
	return (
		<div className="flex items-start justify-between gap-4 flex-wrap w-full">
			<div className="flex flex-col gap-1">
				{stepBadge && (
					<span className="text-xs font-semibold text-[var(--accent-primary)] uppercase tracking-widest">
						{stepBadge}
					</span>
				)}
				<h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
				<p className="text-sm text-[var(--text-secondary)] max-w-2xl">{description}</p>
			</div>
			{primaryAction &&
				(primaryAction.href ? (
					<Link
						href={primaryAction.href}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-semibold transition-colors shrink-0"
					>
						{primaryAction.icon && (
							<AppIcon icon={primaryAction.icon} size="sm" className="text-white" />
						)}
						{primaryAction.label}
					</Link>
				) : (
					<button
						type="button"
						onClick={primaryAction.onClick}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-sm font-semibold transition-colors shrink-0"
					>
						{primaryAction.icon && (
							<AppIcon icon={primaryAction.icon} size="sm" className="text-white" />
						)}
						{primaryAction.label}
					</button>
				))}
		</div>
	);
}
