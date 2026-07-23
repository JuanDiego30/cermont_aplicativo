"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	DASHBOARD_VISUALS,
	type DashboardVisual,
} from "../model/dashboard-visuals";
import { getIconTokensForConcept } from "../model/icon-semantics";

interface LinkableVisualProps {
	visual: DashboardVisual;
	className?: string;
	/** Show the title + description below the image. Default: true. */
	withCaption?: boolean;
	/** Aspect ratio override. Default: intrinsic 800×480 → aspect-[5/3]. */
	aspect?: string;
	/** Visual size variant. */
	size?: "sm" | "md" | "lg";
	/** Priority hint for `next/image` (eager loading). */
	priority?: boolean;
}

const SIZE_MAP: Record<NonNullable<LinkableVisualProps["size"]>, { className: string; imageSizes: string }> = {
	sm: {
		className: "rounded-lg",
		imageSizes: "(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw",
	},
	md: {
		className: "rounded-xl",
		imageSizes: "(min-width: 1280px) 480px, (min-width: 768px) 75vw, 100vw",
	},
	lg: {
		className: "rounded-2xl",
		imageSizes: "(min-width: 1280px) 720px, 100vw",
	},
};

export function LinkableVisual({
	visual,
	className,
	withCaption = true,
	aspect = "aspect-[5/3]",
	size = "md",
	priority = false,
}: LinkableVisualProps) {
	const config = DASHBOARD_VISUALS[visual];
	const sizeConfig = SIZE_MAP[size];
	const tokens = getIconTokensForConcept(config.iconConcept);

	return (
		<Link
			href={config.href}
			className={cn(
				"group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2",
				sizeConfig.className,
				className,
			)}
			aria-label={`${config.title} — ${config.description}`}
		>
			<div
				className={cn(
					"relative w-full overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-surface)]",
					sizeConfig.className,
					aspect,
				)}
			>
				<Image
					src={config.src}
					alt={config.description}
					fill
					sizes={sizeConfig.imageSizes}
					priority={priority}
					className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
				/>
				<div
					className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-canvas-dark)]/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					aria-hidden="true"
				/>
				<div
					className={cn(
						"pointer-events-none absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300",
						tokens.iconBg,
						tokens.iconBorder,
						tokens.iconText,
						"opacity-0 group-hover:opacity-100 group-hover:scale-110",
					)}
					aria-hidden="true"
				>
					<ArrowUpRight className="size-4" />
				</div>
			</div>
			{withCaption && (
				<div className="mt-3 flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold text-[var(--color-ink)]">
							{config.title}
						</p>
						<p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-charcoal)]">
							{config.description}
						</p>
					</div>
				</div>
			)}
		</Link>
	);
}
