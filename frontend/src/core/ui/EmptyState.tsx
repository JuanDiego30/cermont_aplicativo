import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { MOTION } from "@/components/motion/motion-classes";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { EmptyStateIllustration, type EmptyStateKind } from "./EmptyStateIllustration";

interface EmptyStateActionBase {
	label: string;
	icon?: LucideIcon;
	variant?: "primary" | "secondary";
}

export type EmptyStateAction =
	| (EmptyStateActionBase & { onClick: () => void; href?: never })
	| (EmptyStateActionBase & { href: string; onClick?: never });

export interface EmptyStateProps {
	title: string;
	description?: string;
	icon?: EmptyStateKind | ComponentType<{ className?: string }>;
	action?: EmptyStateAction;
	secondaryAction?: EmptyStateAction;
	children?: ReactNode;
	className?: string;
	"aria-label"?: string;
}

export function EmptyState({
	title,
	description,
	icon = "generic",
	action,
	secondaryAction,
	children,
	className,
	"aria-label": ariaLabel = "Sin resultados",
}: EmptyStateProps) {
	const illustrationKind = typeof icon === "string" ? icon : "generic";
	const CustomIcon = typeof icon === "string" ? undefined : icon;

	return (
		<section
			aria-label={ariaLabel}
			className={cn(
				`${MOTION.revealUp} motion-panel flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-6 py-12 text-center shadow-card`,
				className,
			)}
		>
			<EmptyStateIllustration kind={illustrationKind} customIcon={CustomIcon} />
			<h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)] [text-wrap:balance]">
				{title}
			</h3>
			{description && (
				<p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
					{description}
				</p>
			)}
			{action || secondaryAction || children ? (
				<div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
					{action ? <EmptyStateButton action={action} /> : null}
					{secondaryAction ? <EmptyStateButton action={secondaryAction} /> : null}
					{children}
				</div>
			) : null}
		</section>
	);
}

function EmptyStateButton({ action }: { action: EmptyStateAction }) {
	const ActionIcon = action.icon;

	if (action.href) {
		return (
			<Button asChild variant={action.variant === "secondary" ? "secondary" : "primary"}>
				<Link href={action.href} className="min-h-11">
					{ActionIcon ? <ActionIcon aria-hidden="true" /> : null}
					{action.label}
				</Link>
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant={action.variant === "secondary" ? "secondary" : "primary"}
			onClick={action.onClick}
			className="min-h-11"
		>
			{ActionIcon ? <ActionIcon aria-hidden="true" /> : null}
			{action.label}
		</Button>
	);
}
