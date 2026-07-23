"use client";

import { cn } from "@/lib/utils";

interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyStateCard({ icon, title, description, action, className }: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 px-6",
        "bg-[var(--card)] border border-[var(--line)] rounded-xl",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-muted)]">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[var(--text-soft)]">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)] max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
