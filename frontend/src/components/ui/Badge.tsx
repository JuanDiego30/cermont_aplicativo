import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-brand-annotate border border-brand-annotate/20",
  warning: "bg-warning-bg text-brand-warn border border-brand-warn/20",
  danger:  "bg-danger-bg text-brand-error border border-brand-error/20",
  info:    "bg-info-bg text-brand-blue-light border border-brand-blue-light/20",
  neutral: "bg-surface text-slate border border-hairline",
  brand:   "bg-brand-blue/10 text-brand-blue border border-brand-blue/20",
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px] font-mono",
  md: "px-2.5 py-1 text-[11px] font-semibold",
  lg: "px-3 py-1.5 text-xs font-bold",
};

export function Badge({ children, variant = "neutral", size = "md", icon, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full whitespace-nowrap",
      VARIANT_STYLES[variant],
      SIZE_STYLES[size],
      className
    )}>
      {icon && <span className="size-3">{icon}</span>}
      {children}
    </span>
  );
}
