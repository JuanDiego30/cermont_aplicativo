"use client";
import React from "react";
import { Badge } from "@/components/ui/Badge";
import {
    OrdersIcon,
    PlayCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from "@/components/icons";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconBgColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    icon,
    trend,
    iconBgColor = "bg-gray-100 dark:bg-gray-800",
}) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6 transition-all hover:shadow-md">
            <div className={`flex items-center justify-center w-12 h-12 ${iconBgColor} rounded-xl`}>
                {icon}
            </div>

            <div className="flex items-end justify-between mt-5">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {label}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                        {value}
                    </h4>
                </div>
                {trend && (
                    <Badge color={trend.isPositive ? "success" : "error"}>
                        {trend.isPositive ? (
                            <ArrowUpIcon className="text-green-600" />
                        ) : (
                            <ArrowDownIcon className="text-red-600" />
                        )}
                        {Math.abs(trend.value).toFixed(1)}%
                    </Badge>
                )}
            </div>
        </div>
    );
};

// Dashboard Metrics Grid
export const DashboardMetrics: React.FC = () => {
    // TODO: Replace with real data from API
    const metrics = [
        {
            label: "Órdenes Activas",
            value: 12,
            icon: <OrdersIcon className="text-gray-800 size-6 dark:text-white/90" />,
            trend: { value: 11.01, isPositive: true },
            iconBgColor: "bg-blue-100 dark:bg-blue-500/20",
        },
        {
            label: "En Ejecución",
            value: 5,
            icon: <PlayCircleIcon className="text-amber-600 size-6 dark:text-amber-400" />,
            trend: { value: 9.05, isPositive: false },
            iconBgColor: "bg-amber-100 dark:bg-amber-500/20",
        },
        {
            label: "Completadas Hoy",
            value: 3,
            icon: <CheckCircleIcon className="text-green-600 size-6 dark:text-green-400" />,
            trend: { value: 15.32, isPositive: true },
            iconBgColor: "bg-green-100 dark:bg-green-500/20",
        },
        {
            label: "Pendientes",
            value: 8,
            icon: <ClockIcon className="text-red-600 size-6 dark:text-red-400" />,
            trend: { value: 5.67, isPositive: false },
            iconBgColor: "bg-red-100 dark:bg-red-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {metrics.map((metric) => (
                <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    trend={metric.trend}
                    iconBgColor={metric.iconBgColor}
                />
            ))}
        </div>
    );
};

export default DashboardMetrics;
