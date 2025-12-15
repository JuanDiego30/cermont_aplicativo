/**
 * ARCHIVO: HESDashboard.tsx
 * FUNCION: Panel de métricas de seguridad HES (equipos disponibles, en mantenimiento, rechazados)
 * IMPLEMENTACION: Consulta API /hes/status-report via SWR, muestra KPIs en tarjetas con iconos
 * DEPENDENCIAS: React, SWR, apiClient, lucide-react, swrKeys
 * EXPORTS: HESDashboard (named)
 */
'use client';
import React from 'react';
import useSWR from 'swr';
import { apiClient } from '../../lib/api';
import { CheckCircle, AlertTriangle, XCircle, Shield, Package } from 'lucide-react';
import { swrKeys } from '@/lib/swr-config';

interface HESStatusReport {
    totalEquipos: number;
    disponibles: number;
    enMantenimiento: number;
    rechazados: number;
    sinInspeccionar: number;
    tasaDisponibilidad: string;
    ultimaActualizacion: string;
}

export function HESDashboard() {
    const { data, isLoading, error } = useSWR<HESStatusReport>(
        swrKeys.hes.stats(),
        async () => {
            const res = await apiClient.get<{ status: string; report: HESStatusReport }>('/hes/status-report');
            return res.report;
        },
        { revalidateOnFocus: false }
    );

    if (isLoading) return <div className="p-4 text-center">Cargando métricas HES...</div>;
    if (error || !data) return <div className="p-4 text-center text-red-500">Error al cargar datos HES</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panel de Seguridad en Alturas</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Disponibilidad */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Disponibilidad</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.tasaDisponibilidad}%</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span className="text-green-600 font-medium mr-1">{data.disponibles}</span> equipos operativos
                    </div>
                </div>

                {/* Sin Inspeccionar */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencimiento Inspección</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.sinInspeccionar}</h3>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900/20">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Equipos sin revisar &gt; 30 días
                    </div>
                </div>

                {/* En Mantenimiento */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En Mantenimiento</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.enMantenimiento}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Equipos en reparación
                    </div>
                </div>

                {/* Rechazados */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rechazados</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{data.rechazados}</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Equipos fuera de servicio
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                Última actualización: {data.ultimaActualizacion}
            </div>
        </div>
    );
}
