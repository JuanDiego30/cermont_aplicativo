"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { Button } from "@/core/ui/Button";
import { EmptyStateIllustration, type EmptyStateKind } from "@/core/ui/EmptyStateIllustration";
import { cn } from "@/lib/utils";

interface ContextualAction {
	label: string;
	href?: string;
	onClick?: () => void;
	variant?: "primary" | "secondary";
}

interface PrerequisiteLink {
	label: string;
	href: string;
}

export interface ContextualEmptyStateProps {
	kind: EmptyStateKind;
	title: string;
	description?: string;
	/** Shows an explanation of why the list is empty (e.g. "No hay evidencias porque no has seleccionado una orden") */
	reason?: string;
	/** CTA button */
	action?: ContextualAction;
	/** Optional secondary action */
	secondaryAction?: ContextualAction;
	/** Link to required pre-requisite module */
	prerequisite?: PrerequisiteLink;
	/** Icon override */
	icon?: ComponentType<{ className?: string }>;
	className?: string;
}

export function ContextualEmptyState({
	kind,
	title,
	description,
	reason,
	action,
	secondaryAction,
	prerequisite,
	icon: CustomIcon,
	className,
}: ContextualEmptyStateProps) {
	return (
		<section
			aria-label="Sin resultados"
			className={cn(
				"flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-6 py-12 text-center shadow-card",
				className,
			)}
		>
			<EmptyStateIllustration kind={kind} customIcon={CustomIcon} />

			<h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)] [text-wrap:balance]">
				{title}
			</h3>

			{description && (
				<p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
					{description}
				</p>
			)}

			{reason && (
				<p className="mt-3 max-w-xs rounded-lg bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-tertiary)]">
					{reason}
				</p>
			)}

			{action || secondaryAction || prerequisite ? (
				<div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
					{action && <ContextualActionButton action={action} />}
					{secondaryAction && <ContextualActionButton action={secondaryAction} />}
					{prerequisite && (
						<Button asChild variant="secondary">
							<Link href={prerequisite.href}>
								{prerequisite.label}
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
						</Button>
					)}
				</div>
			) : null}
		</section>
	);
}

function ContextualActionButton({ action }: { action: ContextualAction }) {
	if (action.href) {
		return (
			<Button asChild variant={action.variant === "secondary" ? "secondary" : "primary"}>
				<Link href={action.href}>{action.label}</Link>
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant={action.variant === "secondary" ? "secondary" : "primary"}
			onClick={action.onClick}
		>
			{action.label}
		</Button>
	);
}
