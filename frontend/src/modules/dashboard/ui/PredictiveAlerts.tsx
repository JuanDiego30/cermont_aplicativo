"use client";

import {
  AlertTriangle,
  TrendingDown,
  AlertCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredictiveAlert } from "../api/dashboard.service";

interface PredictiveAlertsProps {
  alerts: PredictiveAlert[];
}

const severityConfig: Record<
  string,
  {
    bg: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
    text: string;
  }
> = {
  critical: {
    bg: "bg-[var(--color-danger-bg)]",
    border: "border-[var(--color-danger)]/40",
    icon: AlertTriangle,
    text: "text-[var(--color-danger)]",
  },
  high: {
    bg: "bg-[var(--color-warning-bg)]",
    border: "border-[var(--color-warning)]/50",
    icon: AlertCircle,
    text: "text-[var(--color-warning)]",
  },
  medium: {
    bg: "bg-[var(--color-warning-bg)]",
    border: "border-[var(--color-warning)]/30",
    icon: TrendingDown,
    text: "text-[var(--color-warning)]",
  },
  low: {
    bg: "bg-[var(--color-info-bg)]",
    border: "border-[var(--color-info)]/30",
    icon: Zap,
    text: "text-[var(--color-info)]",
  },
};

export function PredictiveAlerts({ alerts }: PredictiveAlertsProps) {
  if (!alerts.length) { return null; }

  return (
    <section className="space-y-2" aria-label="Alertas predictivas">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
        Alertas predictivas
      </h3>
      {alerts.slice(0, 3).map((alert) => {
        const config = severityConfig[alert.severity] ?? severityConfig.low;
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              config.bg,
              config.border,
            )}
          >
            <Icon
              className={cn("w-4 h-4 mt-0.5 shrink-0", config.text)}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("text-sm font-semibold", config.text)}>
                  {alert.title}
                </p>
                <span
                  className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded shrink-0",
                    alert.probability >= 70
                      ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                      : alert.probability >= 40
                        ? "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
                        : "bg-[var(--color-info-bg)] text-[var(--color-info)]",
                  )}
                >
                  {alert.probability}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {alert.description}
              </p>
              {alert.suggestedAction && (
                <p className="text-xs font-medium text-[var(--color-brand-blue)] mt-1">
                  {alert.suggestedAction}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
