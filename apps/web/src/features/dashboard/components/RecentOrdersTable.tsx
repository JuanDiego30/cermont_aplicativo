"use client";
import React from "react";
import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";

interface Order {
    id: number;
    code: string;
    description: string;
    type: string;
    assignedTo: string;
    status: "Completada" | "En Proceso" | "Pendiente";
}

// TODO: Replace with real data from API
const recentOrders: Order[] = [
    {
        id: 1,
        code: "OT-2024-001",
        description: "Mantenimiento preventivo - Línea 1",
        type: "Mantenimiento",
        assignedTo: "Carlos García",
        status: "Completada",
    },
    {
        id: 2,
        code: "OT-2024-002",
        description: "Instalación de equipo nuevo",
        type: "Instalación",
        assignedTo: "María López",
        status: "En Proceso",
    },
    {
        id: 3,
        code: "OT-2024-003",
        description: "Reparación de bomba hidráulica",
        type: "Reparación",
        assignedTo: "Juan Martínez",
        status: "Completada",
    },
    {
        id: 4,
        code: "OT-2024-004",
        description: "Calibración de instrumentos",
        type: "Calibración",
        assignedTo: "Ana Rodríguez",
        status: "Pendiente",
    },
    {
        id: 5,
        code: "OT-2024-005",
        description: "Inspección de seguridad mensual",
        type: "Inspección",
        assignedTo: "Pedro Sánchez",
        status: "Completada",
    },
];

export default function RecentOrdersTable() {
    const getStatusColor = (status: Order["status"]) => {
        switch (status) {
            case "Completada":
                return "success";
            case "En Proceso":
                return "warning";
            case "Pendiente":
                return "error";
            default:
                return "gray";
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Órdenes Recientes
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 transition-colors">
                        <svg
                            className="stroke-current fill-white dark:fill-gray-800"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2.29004 5.90393H17.7067"
                                stroke=""
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M17.7075 14.0961H2.29085"
                                stroke=""
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                                fill=""
                                stroke=""
                                strokeWidth="1.5"
                            />
                            <path
                                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                                fill=""
                                stroke=""
                                strokeWidth="1.5"
                            />
                        </svg>
                        Filtrar
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 transition-colors">
                        Ver todas
                    </button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                            >
                                Código
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                            >
                                Descripción
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                            >
                                Tipo
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                            >
                                Asignado a
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400"
                            >
                                Estado
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                                <TableCell className="py-3">
                                    <span className="font-medium text-gray-800 text-sm dark:text-white/90">
                                        {order.code}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3 text-gray-600 text-sm dark:text-gray-400 max-w-50 truncate">
                                    {order.description}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                    {order.type}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                                    {order.assignedTo}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge
                                        size="sm"
                                        color={getStatusColor(order.status)}
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
