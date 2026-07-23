"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FlowStepCard } from "./FlowStepCard";
import { SectionHeader } from "./SectionHeader";
import { CERMONT_FLOW_STEPS, FLOW_STAGE_LABELS, FLOW_STAGE_COLORS } from "../model/types";
import type { FlowStage } from "../model/types";

type TabOption = "all" | FlowStage;

const tabs: { value: TabOption; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "comercial", label: FLOW_STAGE_LABELS.comercial },
  { value: "operativo", label: FLOW_STAGE_LABELS.operativo },
  { value: "cierre", label: FLOW_STAGE_LABELS.cierre },
  { value: "financiero", label: FLOW_STAGE_LABELS.financiero },
];

export function FlowStageTabs() {
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const filteredSteps =
    activeTab === "all" ? CERMONT_FLOW_STEPS : CERMONT_FLOW_STEPS.filter((s) => s.stage === activeTab);

  return (
    <div>
      <SectionHeader title="Flujo Operativo" subtitle="Cadena documental de 14 pasos de CERMONT" />
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const stageColor = tab.value !== "all" ? FLOW_STAGE_COLORS[tab.value as FlowStage] : null;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150",
                isActive
                  ? stageColor
                    ? `${stageColor.bg} ${stageColor.text} border border-current`
                    : "bg-[var(--cermont-blue)] text-white"
                  : "bg-[var(--bg-muted)] text-[var(--text-soft)] hover:bg-[var(--bg-soft)] border border-transparent",
              )}
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className="ml-1.5 opacity-70">
                  ({CERMONT_FLOW_STEPS.filter((s) => s.stage === tab.value).length})
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredSteps.map((step) => (
          <FlowStepCard key={step.number} step={step} />
        ))}
      </div>
    </div>
  );
}
