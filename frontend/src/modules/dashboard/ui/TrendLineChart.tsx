"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { MonthlyTrendPoint } from "../model/types";

interface TrendLineChartProps {
  data: MonthlyTrendPoint[];
}

interface PayloadEntry {
  name: string;
  value: number;
  color: string;
}

// biome-ignore lint/suspicious/noExplicitAny: recharts tooltip props signature
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) { return null; }
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-lg p-3 shadow-card text-xs">
      <p className="font-semibold text-[var(--text)] mb-1.5">{label}</p>
      {(payload as PayloadEntry[]).map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-[var(--text-soft)]">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name === "creadas" ? "Creadas" : "Completadas"}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--text-muted)]">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-soft)" }} iconType="circle" iconSize={8} />
        <Line type="monotone" dataKey="creadas" stroke="var(--cermont-blue)" strokeWidth={2} dot={{ r: 3, fill: "var(--cermont-blue)" }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="completadas" stroke="var(--cermont-green)" strokeWidth={2} dot={{ r: 3, fill: "var(--cermont-green)" }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
