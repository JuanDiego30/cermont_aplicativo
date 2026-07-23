"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { OrdersByStatusPoint } from "../model/types";

interface StatusDonutChartProps {
  data: OrdersByStatusPoint[];
}

// biome-ignore lint/suspicious/noExplicitAny: recharts tooltip props
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) { return null; }
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-lg p-3 shadow-card text-xs">
      <p className="font-semibold text-[var(--text)]">{payload[0].name}</p>
      <p className="text-[var(--text-soft)]">{payload[0].value} órdenes</p>
    </div>
  );
}

export function StatusDonutChart({ data }: StatusDonutChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--text-muted)]">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="75%" paddingAngle={3} dataKey="count" nameKey="estado">
          {data.map((entry) => (
            <Cell key={`cell-${entry.estado}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--text-soft)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
