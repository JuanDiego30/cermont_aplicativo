"use client";

import { cn } from "@/lib/utils";
import type { HealthScore } from "../api/dashboard.service";

interface HealthScoreGaugeProps {
  score: HealthScore | null;
  isLoading: boolean;
}

function getScoreColor(v: number): string {
  return v >= 80
    ? "text-[var(--color-success)]"
    : v >= 50
      ? "text-[var(--color-warning)]"
      : "text-[var(--color-danger)]";
}

function getScoreBg(v: number): string {
  return v >= 80
    ? "bg-[var(--color-cermont-green-bg)]"
    : v >= 50
      ? "bg-[var(--color-warning-bg)]"
      : "bg-[var(--color-danger-bg)]";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "good": return "var(--color-success)";
    case "fair": return "var(--color-warning)";
    case "poor": return "var(--color-danger)";
    default: return "var(--text-tertiary)";
  }
}

export function HealthScoreGauge({ score, isLoading }: HealthScoreGaugeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--surface-secondary)] animate-pulse">
        <div className="w-14 h-14 rounded-full bg-[var(--border-subtle)]" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-[var(--border-subtle)] rounded" />
          <div className="h-3 w-16 bg-[var(--border-subtle)] rounded" />
        </div>
      </div>
    );
  }

  if (!score) { return null; }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-subtle)]">
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0",
          getScoreBg(score.overall),
          getScoreColor(score.overall),
        )}
      >
        {score.overall}
      </div>
      <div className="text-left min-w-0">
        <p className="text-xs font-semibold text-[var(--text-primary)]">
          Salud Operacional
        </p>
        <p className={cn("text-xs font-medium", getScoreColor(score.overall))}>
          {score.trend === "improving"
            ? "Mejorando"
            : score.trend === "declining"
              ? "Declinando"
              : "Estable"}
        </p>
        <div className="flex gap-1 mt-1">
          {score.breakdown.slice(0, 4).map((b) => (
            <div
              key={b.label}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(b.status) }}
              title={`${b.label}: ${b.score}/${b.maxScore}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
