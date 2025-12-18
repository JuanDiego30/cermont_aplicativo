"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronRight,
    FileText,
} from "lucide-react";

export interface MobileOrderItem {
    id: string;
    numero: string;
    cliente: string;
    estado: string;
    fecha: string;
    prioridad?: string;
}

interface MobileOrderListProps {
    orders: MobileOrderItem[];
    title?: string;
    showAllLink?: string;
    className?: string;
}

const estadoConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    completada: {
        icon: CheckCircle,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-500/20",
    },
    ejecucion: {
        icon: Clock,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-500/20",
    },
    en_ejecucion: {
        icon: Clock,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-500/20",
    },
    planeacion: {
        icon: FileText,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-500/20",
    },
    pausada: {
        icon: AlertTriangle,
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-100 dark:bg-gray-500/20",
    },
};

function getEstadoConfig(estado: string) {
    const key = estado.toLowerCase().replace(" ", "_");
    return estadoConfig[key] || estadoConfig.pausada;
}

export function MobileOrderList({
    orders,
    title = "Órdenes Recientes",
    showAllLink = "/dashboard/ordenes",
    className,
}: MobileOrderListProps) {
    return (
        <div
            className={cn(
                "rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <Link
                    href={showAllLink}
                    className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                    Ver todo
                </Link>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {orders.map((order) => {
                    const config = getEstadoConfig(order.estado);
                    const Icon = config.icon;

                    return (
                        <Link
                            key={order.id}
                            href={`/dashboard/ordenes/${order.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors active:bg-gray-100 dark:active:bg-gray-700/50"
                        >
                            {/* Status Icon */}
                            <div
                                className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                    config.bg
                                )}
                            >
                                <Icon className={cn("h-5 w-5", config.color)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        #{order.numero}
                                    </p>
                                    {order.prioridad && order.prioridad.toLowerCase() === "urgente" && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                            Urgente
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {order.cliente}
                                </p>
                            </div>

                            {/* Date & Arrow */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {order.fecha}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {orders.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay órdenes recientes
                </div>
            )}
        </div>
    );
}

export default MobileOrderList;
