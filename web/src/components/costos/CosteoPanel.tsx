"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    PlusCircle,
    Trash2,
    Package,
    Wrench,
    Truck,
    HardHat,
    MoreHorizontal
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface CostoItem {
    id: string;
    concepto: string;
    monto: number;
    tipo: string;
    descripcion?: string;
    createdAt: string;
}

interface ResumenCostos {
    totalPresupuestado: number;
    totalReal: number;
    varianza: number;
    porcentajeVarianza: number;
    porTipo: {
        tipo: string;
        presupuestado: number;
        real: number;
        varianza: number;
    }[];
    alertas: {
        tipo: "warning" | "danger";
        mensaje: string;
    }[];
}

// ============================================
// API CALLS
// ============================================

const fetchResumenCostos = async (ordenId: string): Promise<ResumenCostos> => {
    const response = await apiClient.get(`/costos/resumen/${ordenId}`);
    return response.data.data;
};

const fetchCostosByOrden = async (ordenId: string) => {
    const response = await apiClient.get(`/costos/orden/${ordenId}`);
    return response.data.data;
};

const registrarCosto = async (data: {
    ordenId: string;
    concepto: string;
    monto: number;
    tipo: string;
    descripcion?: string;
}) => {
    const response = await apiClient.post("/costos/registrar", data);
    return response.data.data;
};

const eliminarCosto = async (costoId: string) => {
    const response = await apiClient.delete(`/costos/${costoId}`);
    return response.data;
};

// ============================================
// ICON HELPER
// ============================================

const getTipoIcon = (tipo: string) => {
    switch (tipo) {
        case "material":
            return <Package className="w-4 h-4" />;
        case "mano_obra":
            return <HardHat className="w-4 h-4" />;
        case "transporte":
            return <Truck className="w-4 h-4" />;
        case "equipo":
            return <Wrench className="w-4 h-4" />;
        default:
            return <MoreHorizontal className="w-4 h-4" />;
    }
};

const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
        material: "Material",
        mano_obra: "Mano de Obra",
        transporte: "Transporte",
        equipo: "Equipo",
        otros: "Otros",
    };
    return labels[tipo] || tipo;
};

// ============================================
// COMPONENT
// ============================================

interface CosteoPanelProps {
    ordenId: string;
    editable?: boolean;
}

export function CosteoPanel({ ordenId, editable = true }: CosteoPanelProps) {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [newCosto, setNewCosto] = useState({
        concepto: "",
        monto: 0,
        tipo: "material",
        descripcion: "",
    });

    // Queries
    const { data: resumen, isLoading: loadingResumen } = useQuery({
        queryKey: ["costos-resumen", ordenId],
        queryFn: () => fetchResumenCostos(ordenId),
    });

    const { data: orden, isLoading: loadingCostos } = useQuery({
        queryKey: ["costos-orden", ordenId],
        queryFn: () => fetchCostosByOrden(ordenId),
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: registrarCosto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costos-resumen", ordenId] });
            queryClient.invalidateQueries({ queryKey: ["costos-orden", ordenId] });
            setShowForm(false);
            setNewCosto({ concepto: "", monto: 0, tipo: "material", descripcion: "" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: eliminarCosto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["costos-resumen", ordenId] });
            queryClient.invalidateQueries({ queryKey: ["costos-orden", ordenId] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMutation.mutate({
            ordenId,
            ...newCosto,
        });
    };

    if (loadingResumen || loadingCostos) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-gray-200 rounded" />
                        <div className="h-24 bg-gray-200 rounded" />
                        <div className="h-24 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    const costos: CostoItem[] = orden?.costos || [];
    const varianzaPositiva = (resumen?.varianza || 0) > 0;

    return (
        <div className="space-y-6">
            {/* Header con Resumen */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            Costeo en Tiempo Real
                        </h3>
                        {editable && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Agregar Costo
                            </button>
                        )}
                    </div>
                </div>

                {/* Alertas */}
                {resumen?.alertas && resumen.alertas.length > 0 && (
                    <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                        {resumen.alertas.map((alerta, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2 text-sm ${alerta.tipo === "danger"
                                        ? "text-red-700 dark:text-red-400"
                                        : "text-amber-700 dark:text-amber-400"
                                    }`}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                {alerta.mensaje}
                            </div>
                        ))}
                    </div>
                )}

                {/* Cards de Resumen */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Presupuestado */}
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            Presupuestado
                        </p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                            ${resumen?.totalPresupuestado?.toLocaleString("es-CO") || 0}
                        </p>
                    </div>

                    {/* Real */}
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            Costo Real
                        </p>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                            ${resumen?.totalReal?.toLocaleString("es-CO") || 0}
                        </p>
                    </div>

                    {/* Varianza */}
                    <div
                        className={`p-4 rounded-xl border ${varianzaPositiva
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            }`}
                    >
                        <p
                            className={`text-sm font-medium ${varianzaPositiva
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}
                        >
                            Varianza
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            {varianzaPositiva ? (
                                <TrendingUp className="w-5 h-5 text-red-500" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-green-500" />
                            )}
                            <p
                                className={`text-2xl font-bold ${varianzaPositiva
                                        ? "text-red-900 dark:text-red-100"
                                        : "text-green-900 dark:text-green-100"
                                    }`}
                            >
                                {varianzaPositiva ? "+" : ""}
                                ${resumen?.varianza?.toLocaleString("es-CO") || 0}
                            </p>
                            <span
                                className={`text-sm ${varianzaPositiva
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-600 dark:text-green-400"
                                    }`}
                            >
                                ({resumen?.porcentajeVarianza || 0}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario para agregar costo */}
            {showForm && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Registrar Nuevo Costo
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Concepto
                                </label>
                                <input
                                    type="text"
                                    value={newCosto.concepto}
                                    onChange={(e) =>
                                        setNewCosto({ ...newCosto, concepto: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Cable eléctrico 12 AWG"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Monto ($)
                                </label>
                                <input
                                    type="number"
                                    value={newCosto.monto}
                                    onChange={(e) =>
                                        setNewCosto({ ...newCosto, monto: parseFloat(e.target.value) || 0 })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={newCosto.tipo}
                                    onChange={(e) => setNewCosto({ ...newCosto, tipo: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="material">Material</option>
                                    <option value="mano_obra">Mano de Obra</option>
                                    <option value="transporte">Transporte</option>
                                    <option value="equipo">Equipo</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={newCosto.descripcion}
                                    onChange={(e) =>
                                        setNewCosto({ ...newCosto, descripcion: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Detalles adicionales"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={addMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {addMutation.isPending ? "Guardando..." : "Guardar Costo"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla de Costos */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        Desglose de Costos ({costos.length})
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Concepto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Fecha
                                </th>
                                {editable && (
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {costos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay costos registrados aún
                                    </td>
                                </tr>
                            ) : (
                                costos.map((costo) => (
                                    <tr
                                        key={costo.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {costo.concepto}
                                                </p>
                                                {costo.descripcion && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {costo.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                {getTipoIcon(costo.tipo)}
                                                {getTipoLabel(costo.tipo)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                            ${costo.monto.toLocaleString("es-CO")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(costo.createdAt).toLocaleDateString("es-CO")}
                                        </td>
                                        {editable && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        if (confirm("¿Eliminar este costo?")) {
                                                            deleteMutation.mutate(costo.id);
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
