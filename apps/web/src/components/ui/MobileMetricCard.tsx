"use client";
import React from "react";
import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MobileMetricCardProps {
    /** Main value to display prominently */
    value: string | number;
    /** Label/description below the value */
    label: string;
    /** Optional trend indicator */
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    /** Optional icon to display */
    icon?: React.ReactNode;
    /** Gradient class (from-X to-Y) */
    gradient?: string;
    /** Additional classes */
    className?: string;
    /** On click handler */
    onClick?: () => void;
}

const gradientPresets = {
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-pink-500",
    green: "from-emerald-500 to-teal-500",
    orange: "from-orange-500 to-red-500",
    brand: "from-brand-500 to-brand-600",
    dark: "from-gray-800 to-gray-900",
};

export function MobileMetricCard({
    value,
    label,
    trend,
    icon,
    gradient = gradientPresets.brand,
    className,
    onClick,
}: MobileMetricCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative min-w-[160px] snap-center rounded-3xl p-5",
                "bg-gradient-to-br text-white shadow-lg",
                gradient,
                onClick && "cursor-pointer active:scale-[0.98] transition-transform",
                className
            )}
        >
            {/* Background decorative circle */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col">
                {/* Icon (optional) */}
                {icon && (
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        {icon}
                    </div>
                )}

                {/* Value */}
                <p className="text-3xl font-bold tracking-tight">{value}</p>

                {/* Label */}
                <p className="mt-1 text-sm text-white/80">{label}</p>

                {/* Trend */}
                {trend && (
                    <div className="mt-3 flex items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                trend.isPositive
                                    ? "bg-white/20 text-white"
                                    : "bg-red-400/30 text-red-100"
                            )}
                        >
                            {trend.isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                        </span>
                        {trend.label && (
                            <span className="text-xs text-white/60">{trend.label}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Horizontal scrolling container for metric cards on mobile
 */
export interface HorizontalMetricsScrollProps {
    children: React.ReactNode;
    className?: string;
}

export function HorizontalMetricsScroll({
    children,
    className,
}: HorizontalMetricsScrollProps) {
    return (
        <div
            className={cn(
                // Mobile: horizontal scroll with snap
                "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide",
                "-mx-4 px-4",
                // Tablet+: grid layout
                "md:grid md:grid-cols-2 md:mx-0 md:overflow-visible",
                // Desktop: 4 columns
                "lg:grid-cols-4",
                className
            )}
        >
            {children}
        </div>
    );
}

export const GRADIENT_PRESETS = gradientPresets;

export default MobileMetricCard;
