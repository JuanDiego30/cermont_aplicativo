"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "draft";

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)] dark:text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] dark:text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] dark:text-[var(--color-danger)]",
  info: "bg-[var(--color-info-bg)] text-[var(--color-info)] dark:text-[var(--color-info)]",
  neutral: "bg-[var(--color-surface)] text-[var(--color-charcoal)]",
  draft: "bg-[var(--color-surface-soft)] text-[var(--color-slate)] border border-[var(--color-hairline)]",
};

export function StatusBadge({ variant, label, icon, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold leading-none",
        variantStyles[variant],
        className,
      )}
    >
      {icon && <span className="w-3 h-3 shrink-0">{icon}</span>}
      {label}
    </span>
  );
}
