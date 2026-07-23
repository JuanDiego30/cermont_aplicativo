"use client";

import { MetricDelta } from "./MetricDelta";
import * as LucideIcons from "lucide-react";
import type { KpiMetric } from "../model/types";
import { KPI_SEMANTICS_CONFIG } from "../model/types";

interface KpiGridProps {
  metrics: KpiMetric[];
  isLoading?: boolean;
}

export function KpiGrid({ metrics }: KpiGridProps) {
  if (!metrics.length) { return null; }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((kpi) => {
        const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[kpi.iconName];
        const config = KPI_SEMANTICS_CONFIG[kpi.semantics];

        return (
          <div key={kpi.id} className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft hover:shadow-card hover:border-[var(--line-strong)] transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${config.iconBg}`}>
                {Icon && <Icon className={`w-5 h-5 ${config.iconColor}`} />}
              </div>
              {kpi.delta !== undefined && <MetricDelta value={kpi.delta} />}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{kpi.label}</p>
              <span className={`text-3xl font-bold tracking-tight ${config.valueColor}`}>{kpi.value}</span>
              {kpi.sublabel && <p className="text-xs text-[var(--text-muted)] pt-1">{kpi.sublabel}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
