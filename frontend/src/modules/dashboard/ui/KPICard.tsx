"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { type ComponentType, useRef } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useRelativeTime } from "@/lib/format/useFormattedDate";

gsap.registerPlugin(useGSAP);

type ColorVariant = "blue" | "green" | "amber" | "red" | "cyan";
type KpiCardVariant = "default" | "solid";

const COLOR_MAP: Record<ColorVariant, { iconBg: string; iconText: string; accent: string }> = {
  blue: { iconBg: "bg-brand-blue/10", iconText: "text-brand-blue", accent: "bg-brand-blue" },
  green: { iconBg: "bg-brand-annotate/10", iconText: "text-brand-annotate", accent: "bg-brand-annotate" },
  amber: { iconBg: "bg-warning-bg", iconText: "text-brand-warn", accent: "bg-brand-warn" },
  red: { iconBg: "bg-danger-bg", iconText: "text-brand-error", accent: "bg-brand-error" },
  cyan: { iconBg: "bg-info-bg", iconText: "text-brand-blue-light", accent: "bg-brand-blue-light" },
};

interface KpiProgressData { current: number; target: number; unit?: string; label?: string }

interface KPICardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
  trend?: { value: number; isPositive: boolean; neutral?: boolean; label?: string };
  sparkline?: number[];
  color?: ColorVariant;
  format?: "number" | "currency";
  className?: string;
  lastUpdatedAt?: string;
  progress?: KpiProgressData;
  alert?: { severity: "warning" | "danger" | "info"; message: string };
  variant?: KpiCardVariant;
}

function formatValue(val: number, fmt: "number" | "currency" = "number"): string {
  if (fmt === "currency") {
    if (val >= 1_000_000) { return `$${(val / 1_000_000).toFixed(1)}M`; }
    return `$${Math.round(val).toLocaleString("es-CO")}`;
  }
  return Math.round(val).toLocaleString("es-CO");
}

function KpiProgress({ current, target, unit, label }: KpiProgressData) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-ink">{current.toLocaleString()} {unit}</span>
        <span className="text-charcoal">{label || `${pct}%`}</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-surface-soft">
        <div className="h-full rounded-full bg-brand-blue transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function KPICard({
  title, value, icon: Icon, description, trend, sparkline, color = "blue",
  format = "number", className, lastUpdatedAt, progress, alert, variant = "default",
}: KPICardProps) {
  const colors = COLOR_MAP[color];
  const cardRef = useRef<HTMLElement>(null);
  const isSolid = variant === "solid";
  const valueRef = useRef<HTMLParagraphElement>(null);
  const numericTarget = typeof value === "number" ? value : null;
  const staticDisplay = typeof value === "string" ? value : formatValue(numericTarget ?? 0, format);
  const relativeUpdatedAt = useRelativeTime(lastUpdatedAt ?? "");

  useGSAP(() => {
    if (!valueRef.current) { return; }
    if (prefersReducedMotion()) {
      if (numericTarget !== null) { valueRef.current.textContent = formatValue(numericTarget, format); }
      return;
    }
    gsap.from(cardRef.current, { opacity: 0, y: 20, duration: 0.5, ease: "power2.out" });
    if (numericTarget !== null) {
      const counter = { value: 0 };
      valueRef.current.textContent = formatValue(0, format);
      gsap.to(counter, {
        value: numericTarget, duration: 1.2, delay: 0.1, ease: "power2.out",
        onUpdate() { if (valueRef.current) { valueRef.current.textContent = formatValue(counter.value, format);  }},
        onComplete() { if (valueRef.current) { valueRef.current.textContent = formatValue(numericTarget, format);  }},
      });
    }
  }, { scope: cardRef, dependencies: [value] });

  const solidBg = "bg-[var(--color-cermont-navy,#0F2C59)]";
  const solidText = "text-white";
  const solidMuted = "text-white/70";
  const solidDesc = "text-white/50";
  const solidIconBg = "bg-white/15";
  const solidIconText = "text-white";

  return (
    <article ref={cardRef} className={cn(`group relative overflow-hidden rounded-xl border p-5 transition-all duration-200`, isSolid ? `${solidBg} border-transparent shadow-brand` : `border-hairline bg-canvas p-5 shadow-card hover:shadow-md`, className)}>
      <div className={cn("absolute left-0 top-0 h-1 w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100", isSolid ? "bg-white/30" : colors.accent)} />
      <div className="flex items-start justify-between">
        <div className={cn("flex size-11 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110", isSolid ? solidIconBg : colors.iconBg, isSolid ? solidIconText : colors.iconText)}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <output className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold font-mono", trend.neutral ? "bg-surface-secondary text-slate" : trend.isPositive ? "bg-success-bg text-brand-blue-deep" : "bg-danger-bg text-brand-error")}>
            {trend.neutral ? <Minus className="size-3" aria-hidden="true" /> : trend.isPositive ? <TrendingUp className="size-3" aria-hidden="true" /> : <TrendingDown className="size-3" aria-hidden="true" />}
            {trend.label ?? `${trend.value}%`}
          </output>
        )}
      </div>
      <div className="mt-4">
        <h3 className={cn("text-micro font-semibold uppercase tracking-wider", isSolid ? solidMuted : "text-slate")}>{title}</h3>
        <p ref={valueRef} suppressHydrationWarning className={cn("mt-1 text-4xl font-bold tracking-tight leading-none", isSolid ? solidText : "text-ink")}>{staticDisplay}</p>
        {description && <p className={cn("mt-2 text-xs font-medium truncate", isSolid ? solidDesc : "text-slate")}>{description}</p>}
        {progress && <KpiProgress {...progress} />}
        {alert && (
          <div className={cn("mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium", alert.severity === "danger" && "bg-danger-bg text-brand-error", alert.severity === "warning" && "bg-warning-bg text-brand-warn", alert.severity === "info" && "bg-info-bg text-brand-blue-light")}>
            {alert.message}
          </div>
        )}
        {relativeUpdatedAt ? <p className="mt-1 text-[11px] text-slate">Actualizado {relativeUpdatedAt}</p> : null}
        {sparkline && sparkline.length > 1 ? <KpiSparkline values={sparkline} label={`Tendencia de ${title}`} /> : null}
      </div>
    </article>
  );
}

function KpiSparkline({ values, label }: { values: number[]; label: string }) {
  const maximum = Math.max(...values, 1);
  const divisor = Math.max(values.length - 1, 1);
  const points = values.map((v, i) => `${(i / divisor) * 100},${30 - (v / maximum) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" role="img" aria-label={label} className="mt-4 h-8 w-full text-brand-blue" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
