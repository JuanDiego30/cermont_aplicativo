"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";

interface MonthlyTrendPoint {
  month: string;
  creadas: number;
  completadas: number;
}

interface MonthlyBarChartProps {
  data: MonthlyTrendPoint[];
  activeIndex?: number;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

// biome-ignore lint/suspicious/noExplicitAny: Recharts tooltip props are loosely typed
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) { return null; }
  const items = payload as TooltipPayloadEntry[];
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 shadow-card text-xs">
      <p className="mb-1.5 font-semibold text-[var(--text-primary)]">{label}</p>
      {items.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="size-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name === "creadas" ? "Creadas" : "Completadas"}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ data, activeIndex }: MonthlyBarChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--text-tertiary)]">
        Sin datos disponibles
      </div>
    );
  }

  const current = activeIndex ?? data.length - 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="creadas" radius={[6, 6, 0, 0]} maxBarSize={28}>
          {data.map((entry) => (
            <Cell
              key={`creadas-${entry.month}`}
              fill={data.indexOf(entry) === current ? "var(--color-brand-blue, #2154A6)" : "var(--color-brand-blue-light, #3A78D8)"}
              opacity={data.indexOf(entry) === current ? 1 : 0.45}
            />
          ))}
        </Bar>
        <Bar dataKey="completadas" radius={[6, 6, 0, 0]} maxBarSize={28}>
          {data.map((entry) => (
            <Cell
              key={`completadas-${entry.month}`}
              fill={data.indexOf(entry) === current ? "var(--color-success, #4CAF50)" : "var(--color-cermont-lime, #7CD966)"}
              opacity={data.indexOf(entry) === current ? 1 : 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
