"use client";

import { Activity, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { DashboardStats } from "../model/types";
import { computeSlaStatus } from "../model/helpers";

interface DashboardHeroProps {
  userName?: string;
  userRole?: string;
  stats: DashboardStats | null;
  isLoading: boolean;
}

function HeroStat({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text)] leading-none">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function DashboardHero({ userName, userRole, stats, isLoading }: DashboardHeroProps) {
  const hasActiveAlerts = (stats?.bloqueadas ?? 0) > 0;
  const slaStatus = computeSlaStatus(stats?.cumplimientoSLA ?? 0);

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--line)] overflow-hidden",
        "bg-gradient-to-br from-[var(--card)] to-[var(--card-muted)]",
        "shadow-card",
      )}
    >
      <div className="flex flex-col lg:flex-row gap-0">
        <div className="flex-1 p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge
              variant={hasActiveAlerts ? "warning" : "success"}
              label={hasActiveAlerts ? "Requiere atención" : "Operación normal"}
              icon={
                hasActiveAlerts ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )
              }
            />
            <StatusBadge variant="info" label={`SLA ${stats?.cumplimientoSLA ?? 0}%`} />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text)] tracking-tight">
            Pulso operativo de CERMONT
          </h1>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {userName ? `Bienvenido, ${userName}` : "Panel de control"}{" "}
            {userRole && <span className="text-[var(--text-muted)]">&middot; {userRole}</span>}
          </p>
          {isLoading && (
            <div className="flex gap-3 mt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 w-28 rounded-lg bg-[var(--bg-muted)] animate-pulse" />
              ))}
            </div>
          )}
          {!isLoading && stats && (
            <div className="flex flex-wrap gap-6 mt-6">
              <HeroStat
                icon={Activity}
                label="Órdenes activas"
                value={stats.ordenesActivas}
                colorClass="bg-[var(--brand-soft)] text-[var(--cermont-blue)]"
              />
              <HeroStat
                icon={CheckCircle2}
                label="Completadas hoy"
                value={stats.completadasMes}
                colorClass="bg-[var(--success-soft)] text-[var(--cermont-green)]"
              />
              <HeroStat
                icon={TrendingUp}
                label="Listas para facturar"
                value={stats.listasFacturar}
                colorClass="bg-[var(--warning-soft)] text-[var(--warning)]"
              />
            </div>
          )}
        </div>
        <div className="lg:w-64 p-5 lg:p-6 border-t lg:border-t-0 lg:border-l border-[var(--line)] flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Cierre Operativo
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-[var(--text)]">
              {isLoading ? "--" : `${stats?.cumplimientoSLA ?? 0}%`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                slaStatus === "success" && "bg-[var(--cermont-green)]",
                slaStatus === "warning" && "bg-[var(--warning)]",
                slaStatus === "danger" && "bg-[var(--danger)]",
              )}
              style={{ width: `${stats?.cumplimientoSLA ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {stats?.cumplimientoSLA === 0
              ? "Sin datos suficientes"
              : `${stats?.ordenesAbiertas ?? 0} abiertas &middot; ${stats?.ordenesCompletadas ?? 0} cerradas`}
          </p>
        </div>
      </div>
    </div>
  );
}
