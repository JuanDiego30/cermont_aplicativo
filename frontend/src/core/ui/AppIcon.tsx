"use client";

import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconVariant =
	| "default" // Neutral gray (muted/secondary)
	| "active" // Cermont Green — current nav item
	| "brand" // Cermont Blue — primary CTA
	| "muted" // Subtle gray — tertiary, breadcrumb separators, empty states
	| "success" // Green tint — completed, positive
	| "warning" // Amber tint — non-critical warnings
	| "danger" // Red tint — blocking errors, destructive actions
	| "info" // Blue tint — informational, neutral
	| "currentColor"; // text-current

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface AppIconProps extends Omit<LucideProps, "ref" | "size"> {
	icon: React.ComponentType<LucideProps>;
	variant?: IconVariant;
	size?: IconSize;
	className?: string;
	"aria-hidden"?: boolean | "true" | "false";
	"aria-label"?: string;
}

const variantStyles: Record<IconVariant, string> = {
	default: "text-[var(--text-muted)]", // Neutral gray
	active: "text-[var(--color-success)]", // Cermont Green — selected nav item
	brand: "text-[var(--color-brand)]", // Cermont Blue — primary CTA
	muted: "text-[var(--text-tertiary)]", // Fainter gray
	success: "text-[var(--color-success)]", // Green
	warning: "text-[var(--color-warning)]", // Amber
	danger: "text-[var(--color-danger)]", // Red
	info: "text-[var(--color-info)]", // Blue
	currentColor: "text-current", // Inherit color from parent
};

const sizeMap: Record<Exclude<IconSize, number>, number> = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 32,
};

export const AppIcon = ({
	icon: Icon,
	variant = "default",
	size = "sm",
	className = "",
	strokeWidth = 1.5,
	"aria-hidden": ariaHidden = "true",
	"aria-label": ariaLabel,
	...props
}: AppIconProps) => {
	if (!Icon) {
		return null;
	}

	const numericSize = typeof size === "number" ? size : sizeMap[size] || 16;

	return (
		<Icon
			size={numericSize}
			strokeWidth={strokeWidth}
			className={cn(variantStyles[variant], "transition-colors duration-150", className)}
			aria-hidden={ariaHidden}
			aria-label={ariaLabel}
			{...props}
		/>
	);
};
