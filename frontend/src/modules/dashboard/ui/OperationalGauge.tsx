"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type GaugeColor = "green" | "blue" | "warning" | "danger" | "navy";

interface OperationalGaugeProps {
  value: number;
  label: string;
  color?: GaugeColor;
  size?: number;
}

const GAUGE_COLOR_MAP: Record<GaugeColor, string> = {
  green: "var(--color-success, #4CAF50)",
  blue: "var(--color-brand-blue, #2154A6)",
  warning: "var(--color-warning, #F59E0B)",
  danger: "var(--color-danger, #EF4444)",
  navy: "var(--color-cermont-navy, #0F2C59)",
};

export function OperationalGauge({
  value,
  label,
  color = "green",
  size = 180,
}: OperationalGaugeProps) {
  const filled = Math.min(value, 100);
  const data = [
    { value: filled },
    { value: 100 - filled },
  ];
  const fillColor = GAUGE_COLOR_MAP[color];

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <ResponsiveContainer width={size} height={size * 0.55}>
        <PieChart>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={55}
            outerRadius={75}
            dataKey="value"
            strokeWidth={0}
            cornerRadius={8}
          >
            <Cell fill={fillColor} />
            <Cell fill="var(--surface-secondary, #F3F6FA)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-1 flex flex-col items-center">
        <span className="text-3xl font-bold text-[var(--text-primary)] leading-none tracking-tight">
          {value}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}
