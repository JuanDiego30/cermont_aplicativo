/**
 * EmptyState — Empty state placeholder component
 *
 * Displays when a list or search has no results.
 * Follows the Cermont design system with optional action button.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Package}
 *   title="No hay órdenes"
 *   description="No se encontraron órdenes de trabajo para los filtros seleccionados."
 *   action={{ label: "Crear orden", onClick: handleCreate }}
 * />
 * ```
 */

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { MOTION } from "@/components/motion/motion-classes";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
	label: string;
	onClick: () => void;
	icon?: LucideIcon;
	variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
	/** Icon component to display */
	icon?: LucideIcon;
	/** Custom icon element (overrides icon prop) */
	customIcon?: ReactNode;
	/** Title text */
	title: string;
	/** Description text */
	description?: string;
	/** Optional action button */
	action?: EmptyStateAction;
	/** Optional secondary action */
	secondaryAction?: EmptyStateAction;
	/** Additional CSS classes */
	className?: string;
	/** Accessible label for the section */
	"aria-label"?: string;
}

export function EmptyState({
	icon: Icon = Inbox,
	customIcon,
	title,
	description,
	action,
	secondaryAction,
	className,
	"aria-label": ariaLabel = "Sin resultados",
}: EmptyStateProps) {
	return (
		<section
			aria-label={ariaLabel}
			className={cn(
				`${MOTION.revealUp} motion-panel flex flex-col items-center justify-center px-6 py-16 text-center`,
				className,
			)}
		>
			{/* Icon */}
			<div className="motion-subtle mb-6 flex size-16 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-tertiary)]">
				{customIcon ?? (Icon && <Icon className="size-8" aria-hidden="true" />)}
			</div>

			{/* Title */}
			<h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)] [text-wrap:balance]">
				{title}
			</h3>

			{/* Description */}
			{description && (
				<p className="mb-8 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
			)}

			{(action || secondaryAction) && (
				<div className="flex flex-col items-center gap-3 sm:flex-row">
					{action && (
						<button
							type="button"
							onClick={action.onClick}
							className={cn(
								`${MOTION.button} inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2`,
								action.variant === "secondary"
									? "border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
									: "bg-[#2154A6] text-white hover:bg-[#1a4390]",
							)}
						>
							{action.icon && <action.icon className="size-4" aria-hidden="true" />}
							{action.label}
						</button>
					)}
					{secondaryAction && (
						<button
							type="button"
							onClick={secondaryAction.onClick}
							className={cn(
								`${MOTION.button} inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2`,
								secondaryAction.variant === "secondary"
									? "border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
									: "bg-[#2154A6] text-white hover:bg-[#1a4390]",
							)}
						>
							{secondaryAction.icon && (
								<secondaryAction.icon className="size-4" aria-hidden="true" />
							)}
							{secondaryAction.label}
						</button>
					)}
				</div>
			)}
		</section>
	);
}
