import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

type DeltaDirection = "up" | "down" | "flat";

interface MetricDeltaProps {
  value: number;
  direction: DeltaDirection;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DIRECTION_STYLES: Record<DeltaDirection, string> = {
  up:   "text-brand-annotate bg-success-bg",
  down: "text-brand-error bg-danger-bg",
  flat: "text-slate bg-surface",
};

const DIRECTION_ICONS: Record<DeltaDirection, typeof TrendingUp> = {
  up:   TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export function MetricDelta({ value, direction, label, size = "sm", className }: MetricDeltaProps) {
  const Icon = DIRECTION_ICONS[direction];
  return (
    <output className={cn(
      "inline-flex items-center gap-1 rounded-full font-bold font-mono",
      DIRECTION_STYLES[direction],
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      className
    )}>
      <Icon className={size === "sm" ? "size-2.5" : "size-3"} aria-hidden="true" />
      {label ?? `${Math.abs(value)}%`}
    </output>
  );
}
