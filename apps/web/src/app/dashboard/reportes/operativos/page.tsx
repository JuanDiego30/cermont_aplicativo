'use client';

import React, { useState } from 'react';
import {
    Activity,
    Clock,
    Users,
    CheckCircle2,
    AlertCircle,
    Download,
    FileSpreadsheet,
    ChevronLeft,
    TrendingUp,
    Wrench
} from 'lucide-react';
import Link from 'next/link';

interface OperativeData {
    periodo: string;
    ordenesCompletadas: number;
    ordenesEnProceso: number;
    ordenesPendientes: number;
    tiempoPromedio: number;
    eficiencia: number;
}

interface TechnicianPerformance {
    nombre: string;
    ordenes: number;
    completadas: number;
    eficiencia: number;
    tiempoPromedio: string;
}

const mockData: OperativeData[] = [
    { periodo: 'Semana 1', ordenesCompletadas: 45, ordenesEnProceso: 12, ordenesPendientes: 8, tiempoPromedio: 4.2, eficiencia: 92 },
    { periodo: 'Semana 2', ordenesCompletadas: 52, ordenesEnProceso: 15, ordenesPendientes: 5, tiempoPromedio: 3.8, eficiencia: 95 },
    { periodo: 'Semana 3', ordenesCompletadas: 38, ordenesEnProceso: 18, ordenesPendientes: 12, tiempoPromedio: 4.5, eficiencia: 88 },
    { periodo: 'Semana 4', ordenesCompletadas: 61, ordenesEnProceso: 10, ordenesPendientes: 4, tiempoPromedio: 3.5, eficiencia: 97 },
];

const technicians: TechnicianPerformance[] = [
    { nombre: 'Carlos Rodriguez', ordenes: 28, completadas: 26, eficiencia: 93, tiempoPromedio: '3.5h' },
    { nombre: 'Maria Garcia', ordenes: 25, completadas: 24, eficiencia: 96, tiempoPromedio: '3.2h' },
    { nombre: 'Juan Martinez', ordenes: 22, completadas: 20, eficiencia: 91, tiempoPromedio: '4.0h' },
    { nombre: 'Ana Lopez', ordenes: 30, completadas: 29, eficiencia: 97, tiempoPromedio: '3.0h' },
    { nombre: 'Pedro Sanchez', ordenes: 18, completadas: 16, eficiencia: 89, tiempoPromedio: '4.2h' },
];

export default function ReportesOperativosPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('1m');

    const totalCompletadas = mockData.reduce((acc, item) => acc + item.ordenesCompletadas, 0);
    const totalEnProceso = mockData.reduce((acc, item) => acc + item.ordenesEnProceso, 0);
    const totalPendientes = mockData.reduce((acc, item) => acc + item.ordenesPendientes, 0);
    const promedioEficiencia = mockData.reduce((acc, item) => acc + item.eficiencia, 0) / mockData.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/reportes"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Reportes Operativos
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Analisis de ordenes de trabajo y rendimiento
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                    >
                        <option value="1w">Ultima semana</option>
                        <option value="1m">Ultimo mes</option>
                        <option value="3m">Ultimos 3 meses</option>
                        <option value="6m">Ultimos 6 meses</option>
                    </select>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Exportar PDF
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Ordenes Completadas */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-100 rounded-full dark:bg-emerald-500/20">
                            <TrendingUp className="w-3 h-3" />
                            +15%
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totalCompletadas}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Ordenes Completadas
                        </p>
                    </div>
                </div>

                {/* En Proceso */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-500/20">
                            Activas
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totalEnProceso}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            En Proceso
                        </p>
                    </div>
                </div>

                {/* Pendientes */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-600 bg-amber-100 rounded-full dark:bg-amber-500/20">
                            Pendientes
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totalPendientes}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Por Asignar
                        </p>
                    </div>
                </div>

                {/* Eficiencia */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20">
                            <Wrench className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full dark:bg-purple-500/20">
                            Promedio
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {promedioEficiencia.toFixed(1)}%
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Eficiencia General
                        </p>
                    </div>
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Progreso Semanal
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Distribucion de ordenes por estado
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completadas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">En Proceso</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                    {mockData.map((item, index) => {
                        const total = item.ordenesCompletadas + item.ordenesEnProceso + item.ordenesPendientes;
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.periodo}</span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Eficiencia: {item.eficiencia}%
                                    </span>
                                </div>
                                <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                                    <div
                                        className="bg-emerald-500 transition-all flex items-center justify-center"
                                        style={{ width: `${(item.ordenesCompletadas / total) * 100}%` }}
                                    >
                                        <span className="text-xs text-white font-medium">{item.ordenesCompletadas}</span>
                                    </div>
                                    <div
                                        className="bg-blue-500 transition-all flex items-center justify-center"
                                        style={{ width: `${(item.ordenesEnProceso / total) * 100}%` }}
                                    >
                                        <span className="text-xs text-white font-medium">{item.ordenesEnProceso}</span>
                                    </div>
                                    <div
                                        className="bg-amber-500 transition-all flex items-center justify-center"
                                        style={{ width: `${(item.ordenesPendientes / total) * 100}%` }}
                                    >
                                        <span className="text-xs text-white font-medium">{item.ordenesPendientes}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Technician Performance */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Rendimiento por Tecnico
                        </h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tecnico
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ordenes Asignadas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Completadas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tiempo Promedio
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Eficiencia
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {technicians.map((tech, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                {tech.nombre.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {tech.nombre}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-400">
                                        {tech.ordenes}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-emerald-600 font-medium">
                                        {tech.completadas}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            {tech.tiempoPromedio}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tech.eficiencia >= 95
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20'
                                                : tech.eficiencia >= 90
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20'
                                            }`}>
                                            {tech.eficiencia}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
