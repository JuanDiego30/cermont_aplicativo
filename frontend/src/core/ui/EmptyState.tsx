import {
	BarChart3,
	Briefcase,
	ClipboardList,
	FileText,
	PackageOpen,
	Search,
	Wrench,
} from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/core/ui/Button";

interface EmptyStateProps {
	title: string;
	description?: string;
	icon?:
		| "orders"
		| "maintenance"
		| "resources"
		| "documents"
		| "proposals"
		| "reports"
		| "search"
		| "generic"
		| ComponentType<{ className?: string }>;
	action?: {
		label: string;
		onClick: () => void;
	};
}

const ICON_MAP = {
	orders: ClipboardList,
	maintenance: Wrench,
	resources: Briefcase,
	documents: FileText,
	proposals: FileText,
	reports: BarChart3,
	search: Search,
	generic: PackageOpen,
};

export function EmptyState({ title, description, icon = "generic", action }: EmptyStateProps) {
	const Icon = typeof icon === "string" ? ICON_MAP[icon] : icon;

	return (
		<div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-6 py-12 text-center shadow-[var(--shadow-1)]">
			<div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-secondary)] text-[var(--text-tertiary)]">
				<Icon className="h-8 w-8" aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
			{description && (
				<p className="mt-1.5 max-w-xs text-sm text-[var(--text-secondary)]">{description}</p>
			)}
			{action && (
				<Button type="button" onClick={action.onClick} className="mt-5">
					{action.label}
				</Button>
			)}
		</div>
	);
}
