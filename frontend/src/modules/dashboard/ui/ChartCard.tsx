"use client";

import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface LegendItem {
  color: string;
  label: string;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  hasData?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  legend?: LegendItem[];
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export function ChartCard({
  title,
  subtitle,
  action,
  hasData = true,
  isLoading,
  loading,
  legend,
  children,
  className,
  height = 260,
}: ChartCardProps) {
  const busy = isLoading || loading;

  return (
    <div className={cn("bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
        {legend && legend.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>
      {busy && (
        <div className="animate-pulse rounded-lg bg-[var(--bg-muted)]" style={{ height }} />
      )}
      {!busy && !hasData && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center" style={{ height }}>
          <BarChart3 className="w-8 h-8 text-[var(--text-muted)]" />
          <p className="text-sm font-semibold text-[var(--text-soft)]">Sin datos disponibles</p>
          <p className="text-xs text-[var(--text-muted)]">Los gráficos se actualizarán cuando haya órdenes registradas.</p>
        </div>
      )}
      {!busy && hasData && <div style={{ height }}>{children}</div>}
    </div>
  );
}
