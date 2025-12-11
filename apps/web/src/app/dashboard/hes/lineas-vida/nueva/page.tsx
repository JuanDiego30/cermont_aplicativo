'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

interface ComponenteInspeccion {
    nombre: string;
    estado: 'C' | 'NC';
    hallazgos: string;
    accionCorrectiva: string;
}

const COMPONENTES_DEFAULT = [
    'PLACA_ANCLAJE_SUPERIOR',
    'ESTRUCTURA_DE_SOPORTE',
    'CABLE_PRINCIPAL',
    'TENSOR',
    'GUIA_CABLE',
    'PLACA_ANCLAJE_INFERIOR',
    'ABSORBEDOR_DE_ENERGIA',
    'CONECTORES',
];

export default function NuevaInspeccionLineaVidaPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        numeroLinea: '',
        fabricante: '',
        ubicacion: '',
        diametroCable: '8mm',
        tipoCable: 'Acero Inoxidable',
        observaciones: '',
    });
    const [componentes, setComponentes] = useState<ComponenteInspeccion[]>(
        COMPONENTES_DEFAULT.map(nombre => ({
            nombre,
            estado: 'C' as const,
            hallazgos: '',
            accionCorrectiva: '',
        }))
    );

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            return apiClient.post('/hes/lineas-vida', data);
        },
        onSuccess: () => {
            router.push('/dashboard/hes/lineas-vida');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const tieneNoConformes = componentes.some(c => c.estado === 'NC');

        mutation.mutate({
            ...formData,
            estado: tieneNoConformes ? 'NO_CONFORME' : 'CONFORME',
            componentes: componentes.map(c => ({
                nombre: c.nombre,
                estado: c.estado,
                hallazgos: c.hallazgos || null,
                accionCorrectiva: c.accionCorrectiva || null,
            })),
        });
    };

    const updateComponente = (index: number, field: keyof ComponenteInspeccion, value: string) => {
        const updated = [...componentes];
        updated[index] = { ...updated[index], [field]: value };
        setComponentes(updated);
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/hes/lineas-vida"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Nueva Inspección de Línea de Vida
                    </h1>
                    <p className="text-sm text-gray-500">OPE-006</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Generales */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Datos de la Línea de Vida</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Número de Línea *</label>
                            <input
                                type="text"
                                required
                                value={formData.numeroLinea}
                                onChange={(e) => setFormData({ ...formData, numeroLinea: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                placeholder="LV-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fabricante *</label>
                            <input
                                type="text"
                                required
                                value={formData.fabricante}
                                onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Ubicación *</label>
                            <input
                                type="text"
                                required
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Edificio A, Piso 5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Diámetro del Cable</label>
                            <select
                                value={formData.diametroCable}
                                onChange={(e) => setFormData({ ...formData, diametroCable: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="6mm">6mm</option>
                                <option value="8mm">8mm</option>
                                <option value="10mm">10mm</option>
                                <option value="12mm">12mm</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo de Cable</label>
                            <select
                                value={formData.tipoCable}
                                onChange={(e) => setFormData({ ...formData, tipoCable: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="Acero Inoxidable">Acero Inoxidable</option>
                                <option value="Acero Galvanizado">Acero Galvanizado</option>
                                <option value="Fibra Sintética">Fibra Sintética</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Componentes */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Inspección de Componentes</h2>
                    <div className="space-y-4">
                        {componentes.map((comp, idx) => (
                            <div
                                key={comp.nombre}
                                className={`p-4 rounded-lg border ${comp.estado === 'NC'
                                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm">
                                        {comp.nombre.replace(/_/g, ' ')}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateComponente(idx, 'estado', 'C')}
                                            className={`px-3 py-1 rounded text-sm font-medium ${comp.estado === 'C'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Conforme
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateComponente(idx, 'estado', 'NC')}
                                            className={`px-3 py-1 rounded text-sm font-medium ${comp.estado === 'NC'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            No Conforme
                                        </button>
                                    </div>
                                </div>

                                {comp.estado === 'NC' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Hallazgos</label>
                                            <input
                                                type="text"
                                                value={comp.hallazgos}
                                                onChange={(e) => updateComponente(idx, 'hallazgos', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700"
                                                placeholder="Describir el problema"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Acción Correctiva</label>
                                            <input
                                                type="text"
                                                value={comp.accionCorrectiva}
                                                onChange={(e) => updateComponente(idx, 'accionCorrectiva', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700"
                                                placeholder="Acción requerida"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Observaciones */}
                <section className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Observaciones Generales</h2>
                    <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        rows={4}
                        placeholder="Observaciones adicionales de la inspección..."
                    />
                </section>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link
                        href="/dashboard/hes/lineas-vida"
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {mutation.isPending ? 'Guardando...' : 'Guardar Inspección'}
                    </button>
                </div>

                {mutation.isError && (
                    <div className="text-red-500 text-sm text-center">
                        Error al guardar la inspección. Intente nuevamente.
                    </div>
                )}
            </form>
        </div>
    );
}
