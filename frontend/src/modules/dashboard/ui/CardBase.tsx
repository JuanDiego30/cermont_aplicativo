"use client";

import { cn } from "@/lib/utils";

interface CardBaseProps {
  children: React.ReactNode;
  className?: string;
  highlight?: "blue" | "green" | "warning" | "danger" | "none";
  padding?: "sm" | "md" | "lg";
}

const highlightMap: Record<string, string> = {
  blue: "border-t-2 border-t-[var(--cermont-blue)]",
  green: "border-t-2 border-t-[var(--cermont-green)]",
  warning: "border-t-2 border-t-[var(--warning)]",
  danger: "border-t-2 border-t-[var(--danger)]",
  none: "",
};

const paddingMap: Record<string, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function CardBase({ children, className, highlight = "none", padding = "md" }: CardBaseProps) {
  return (
    <div
      className={cn(
        "bg-[var(--card)] border border-[var(--line)] rounded-xl shadow-card",
        highlightMap[highlight],
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
