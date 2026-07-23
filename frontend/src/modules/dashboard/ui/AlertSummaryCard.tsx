"use client";

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyStateCard } from "./EmptyStateCard";
import { SectionHeader } from "./SectionHeader";
import Link from "next/link";
import type { SlaAlert } from "../model/types";

interface AlertSummaryCardProps {
  alerts: SlaAlert[];
  isLoading: boolean;
}

export function AlertSummaryCard({ alerts, isLoading }: AlertSummaryCardProps) {
  const hasAlerts = alerts.length > 0;

  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft">
      <SectionHeader
        title="Órdenes en riesgo de SLA"
        subtitle="Casos activos vencidos o con menos de 72h para su fecha objetivo"
        className="mb-4"
      />
      {!isLoading && hasAlerts && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[var(--color-warning-bg)] rounded-lg border border-[var(--color-warning)]/30">
          <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0" />
          <p className="text-xs font-semibold text-[var(--color-warning)]">
            {alerts.length} {alerts.length === 1 ? "orden requiere" : "órdenes requieren"} atención inmediata
          </p>
        </div>
      )}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <div key={idx} className="h-14 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      {!isLoading && !hasAlerts && (
        <EmptyStateCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          title="Sin órdenes en riesgo de SLA"
          description="Todas las órdenes activas están dentro de los plazos."
          className="border-none shadow-none py-6"
        />
      )}
      {!isLoading && hasAlerts && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/ordenes/${alert.ordenId}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                "hover:border-[var(--line-strong)] hover:bg-[var(--bg-soft)]",
                alert.estado === "vencida"
                  ? "border-[var(--danger)] bg-[var(--danger-soft)]"
                  : "border-[var(--warning)] bg-[var(--warning-soft)]",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  alert.estado === "vencida" ? "bg-[var(--danger)] text-white" : "bg-[var(--warning)] text-white",
                )}
              >
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{alert.ordenCodigo}</p>
                  <span
                    className={cn(
                      "text-xs font-bold shrink-0",
                      alert.estado === "vencida" ? "text-[var(--danger)]" : "text-[var(--warning)]",
                    )}
                  >
                    {alert.estado === "vencida" ? "VENCIDA" : `${alert.horasRestantes}h`}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {alert.cliente} &middot; {alert.etapa}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
