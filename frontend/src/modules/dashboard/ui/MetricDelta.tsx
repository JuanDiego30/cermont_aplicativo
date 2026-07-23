"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricDeltaProps {
  value: number;
  suffix?: string;
  className?: string;
}

export function MetricDelta({ value, suffix = "%", className }: MetricDeltaProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const isNegative = value < 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        isPositive && "text-[var(--success)]",
        isNeutral && "text-[var(--text-muted)]",
        isNegative && "text-[var(--danger)]",
        className,
      )}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {isNeutral && <Minus className="w-3 h-3" />}
      {isPositive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}
