"use client";

import { cn } from "@/lib/utils";
import { FLOW_STAGE_COLORS } from "../model/types";
import type { FlowStep } from "../model/types";

interface FlowStepCardProps {
  step: FlowStep;
  isActive?: boolean;
}

export function FlowStepCard({ step, isActive }: FlowStepCardProps) {
  const colors = FLOW_STAGE_COLORS[step.stage];

  return (
    <div
      className={cn(
        "relative bg-[var(--card)] border border-[var(--line)] rounded-xl p-4",
        "hover:shadow-card hover:border-[var(--line-strong)] transition-all duration-200",
        isActive && `border-l-2 ${colors.border}`,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            colors.bg,
            colors.text,
          )}
        >
          {step.number}
        </div>
        {step.count !== undefined && step.count > 0 && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", colors.badge)}>
            {step.count}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-[var(--text)] mb-1">{step.title}</p>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.description}</p>
      <div className="mt-3 pt-2.5 border-t border-[var(--line)]">
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", colors.text)}>
          {step.stage}
        </span>
      </div>
    </div>
  );
}
