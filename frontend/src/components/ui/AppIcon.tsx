import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
type IconVariant = "default" | "active" | "success" | "warning" | "danger" | "muted";

interface AppIconProps {
	icon: LucideIcon;
	size?: IconSize;
	variant?: IconVariant;
	className?: string;
	"aria-label"?: string;
	"aria-hidden"?: boolean;
}

const SIZE_MAP: Record<IconSize, string> = {
	xs: "size-3",
	sm: "size-4",
	md: "size-5",
	lg: "size-6",
	xl: "size-8",
};

const VARIANT_MAP: Record<IconVariant, string> = {
	default: "text-[var(--icon-default)]",
	active: "text-[var(--icon-active)]",
	success: "text-[var(--icon-success)]",
	warning: "text-[var(--icon-warning)]",
	danger: "text-[var(--icon-danger)]",
	muted: "text-[var(--icon-muted)]",
};

export function AppIcon({
	icon: Icon,
	size = "md",
	variant = "default",
	className,
	"aria-label": ariaLabel,
	"aria-hidden": ariaHidden = !ariaLabel,
}: AppIconProps) {
	if (!Icon) {
		return null;
	}

	return (
		<Icon
			className={cn(SIZE_MAP[size], VARIANT_MAP[variant], "shrink-0", className)}
			strokeWidth={1.75}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
		/>
	);
}
