"use client";

import { cn } from "@/lib/utils";
import { OperationalGauge } from "./OperationalGauge";

interface SlaGaugePanelProps {
  slaValue: number;
  totalOrders: number;
  onTimeOrders: number;
  isLoading?: boolean;
}

export function SlaGaugePanel({
  slaValue,
  totalOrders,
  onTimeOrders,
  isLoading,
}: SlaGaugePanelProps) {
  const gaugeColor: "green" | "warning" | "danger" =
    slaValue >= 80 ? "green" : slaValue >= 50 ? "warning" : "danger";

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
        <div className="h-[120px] rounded-lg bg-[var(--surface-secondary)]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-soft">
      <div className="flex flex-col items-center">
        <OperationalGauge value={slaValue} label="Cumplimiento SLA" color={gaugeColor} size={180} />
        <div className="mt-4 w-full border-t border-[var(--border-subtle)] pt-4">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-tertiary)]">
              A tiempo: <strong className="text-[var(--text-secondary)]">{onTimeOrders}</strong>
            </span>
            <span className="text-[var(--text-tertiary)]">
              Total: <strong className="text-[var(--text-secondary)]">{totalOrders}</strong>
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-secondary)]">
            <div
              className={cn("h-full rounded-full transition-all duration-700", {
                "bg-[var(--color-success, #4CAF50)]": gaugeColor === "green",
                "bg-[var(--color-warning, #F59E0B)]": gaugeColor === "warning",
                "bg-[var(--color-danger, #EF4444)]": gaugeColor === "danger",
              })}
              style={{
                width: `${totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
