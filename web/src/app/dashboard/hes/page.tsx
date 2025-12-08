'use client';

import React from 'react';
import Link from 'next/link';
import { HESDashboard } from '../../../components/hes/HESDashboard';
import { InspeccionForm } from '../../../components/hes/InspeccionForm';
import { Plus, ClipboardCheck, Cable, Shield, HardHat, FileCheck } from 'lucide-react';

export default function SafetyPage() {
    const [showForm, setShowForm] = React.useState(false);

    const modulosHES = [
        {
            titulo: 'Inspecciones de Equipos',
            descripcion: 'Arneses, cascos, líneas de vida',
            icono: Shield,
            href: '/dashboard/hes',
            color: 'bg-blue-500',
            activo: true
        },
        {
            titulo: 'Líneas de Vida',
            descripcion: 'OPE-006 - Inspección de sistemas de anclaje',
            icono: Cable,
            href: '/dashboard/hes/lineas-vida',
            color: 'bg-amber-500',
            activo: true
        },
        {
            titulo: 'Certificaciones',
            descripcion: 'Gestión de certificados y vencimientos',
            icono: FileCheck,
            href: '/dashboard/hes/certificaciones',
            color: 'bg-green-500',
            activo: false
        },
        {
            titulo: 'EPP',
            descripcion: 'Equipos de protección personal',
            icono: HardHat,
            href: '/dashboard/hes/epp',
            color: 'bg-purple-500',
            activo: false
        }
    ];

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Seguridad en Alturas (HES)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestión de inspecciones y equipos de seguridad
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Inspección
                </button>
            </div>

            {/* Módulos HES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {modulosHES.map((modulo) => (
                    <Link
                        key={modulo.titulo}
                        href={modulo.activo ? modulo.href : '#'}
                        className={`block p-4 rounded-lg border transition-all ${
                            modulo.activo 
                                ? 'bg-white dark:bg-gray-800 hover:shadow-lg hover:border-blue-300 cursor-pointer' 
                                : 'bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${modulo.color} text-white`}>
                                <modulo.icono className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {modulo.titulo}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {modulo.descripcion}
                                </p>
                                {!modulo.activo && (
                                    <span className="inline-block mt-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                                        Próximamente
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {!showForm ? (
                <HESDashboard />
            ) : (
                <div className="max-w-3xl mx-auto">
                    <InspeccionForm
                        equipoId="temp-id"
                        equipoNumero="Seleccionar Equipo..."
                        onCancel={() => setShowForm(false)}
                        onSuccess={() => setShowForm(false)}
                    />
                </div>
            )}
        </div>
    );
}
