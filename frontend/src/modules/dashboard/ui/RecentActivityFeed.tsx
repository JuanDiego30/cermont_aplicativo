"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, ClipboardList, CheckCircle2, AlertTriangle, Clock, Receipt, ThumbsUp, PlayCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyStateCard } from "./EmptyStateCard";
import { SectionHeader } from "./SectionHeader";
import Link from "next/link";
import type { ActivityEvent } from "../model/types";
import { ACTIVITY_EVENT_CONFIG } from "../model/types";

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList, CheckCircle2, AlertTriangle, Clock,
  Receipt: Receipt as React.ComponentType<{ className?: string }>,
  ThumbsUp, PlayCircle, FileText,
  Activity,
};

interface RecentActivityFeedProps {
  events: ActivityEvent[];
  isLoading: boolean;
  viewAllHref?: string;
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-[var(--bg-muted)] rounded w-3/4 mb-2" />
        <div className="h-3 bg-[var(--bg-muted)] rounded w-1/2" />
      </div>
    </div>
  );
}

export function RecentActivityFeed({ events, isLoading, viewAllHref }: RecentActivityFeedProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-xl p-5 shadow-soft">
      <SectionHeader
        title="Actividad reciente"
        subtitle="Eventos operativos confirmados"
        action={
          viewAllHref ? (
            <Link href={viewAllHref} className="text-xs font-medium text-[var(--cermont-blue)] hover:underline">
              Ver todo &rarr;
            </Link>
          ) : undefined
        }
        className="mb-4"
      />
      {isLoading && (
        <div className="divide-y divide-[var(--line)]">
          {Array.from({ length: 5 }, (_, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <ActivitySkeleton key={idx} />
          ))}
        </div>
      )}
      {!isLoading && events.length === 0 && (
        <EmptyStateCard
          icon={<Activity className="w-5 h-5" />}
          title="Sin actividad reciente"
          description="Los eventos operativos aparecerán aquí."
          className="border-none shadow-none py-6"
        />
      )}
      {!isLoading && events.length > 0 && (
        <div className="divide-y divide-[var(--line)]">
          {events.map((event) => {
            const config = ACTIVITY_EVENT_CONFIG[event.type];
            const IconComponent = config ? iconComponents[config.iconName] : null;
            return (
              <div key={event.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    config?.iconBg ?? "bg-[var(--bg-muted)]",
                  )}
                >
                  {IconComponent && (
                    <IconComponent className={cn("w-4 h-4", config?.iconColor ?? "text-[var(--text-muted)]")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-[var(--text-muted)] truncate">{event.subtitle}</p>
                    <span className="text-[var(--text-muted)] text-xs shrink-0">&middot;</span>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
                {event.ordenCodigo && (
                  <Link
                    href={`/ordenes/${event.ordenId}`}
                    className="text-xs font-mono text-[var(--cermont-blue-light)] hover:underline shrink-0"
                  >
                    {event.ordenCodigo}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
