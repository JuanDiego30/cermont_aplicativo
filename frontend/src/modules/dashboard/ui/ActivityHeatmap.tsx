"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  timestamp: string;
  type?: string;
}

interface ActivityHeatmapProps {
  events: ActivityEvent[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function ActivityHeatmap({ events }: ActivityHeatmapProps) {
  const heatmap = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0),
    );

    events.forEach((event) => {
      const date = new Date(event.timestamp);
      const day = date.getDay();
      const hour = date.getHours();
      if (matrix[day]) {
        matrix[day][hour] = (matrix[day][hour] ?? 0) + 1;
      }
    });

    return matrix;
  }, [events]);

  const maxVal = Math.max(...heatmap.flat(), 1);

  function getIntensity(value: number): string {
    const r = value / maxVal;
    if (r === 0) { return "bg-[var(--surface-secondary)]"; }
    if (r < 0.25) { return "bg-[var(--color-cermont-blue-bg)]"; }
    if (r < 0.5) { return "bg-[var(--color-info-bg)]"; }
    if (r < 0.75) { return "bg-[var(--color-brand-blue-light)]"; }
    return "bg-[var(--color-brand-blue)]";
  }

  if (!events.length) { return null; }

  return (
    <div className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-1)]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
        Actividad por hora
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Distribución de eventos operativos por día y hora
      </p>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 text-[10px] min-w-[500px]">
          <div />
          {HOURS.map((h) => (
            <div
              key={h}
              className="text-center text-[var(--text-tertiary)] font-medium"
            >
              {h.toString().padStart(2, "0")}
            </div>
          ))}
          {DAYS.map((day) => (
            <div key={day} className="contents">
              <div className="text-[var(--text-tertiary)] font-medium flex items-center">
                {day}
              </div>
              {HOURS.map((h) => (
                <div
                  key={`${day}-${h}`}
                  className={cn(
                    "w-full aspect-square rounded-sm",
                    getIntensity(heatmap[DAYS.indexOf(day)]?.[h] ?? 0),
                  )}
                  title={`${day} ${h}:00 — ${heatmap[DAYS.indexOf(day)]?.[h] ?? 0} eventos`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
