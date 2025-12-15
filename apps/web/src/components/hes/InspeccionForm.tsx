/**
 * ARCHIVO: InspeccionForm.tsx
 * FUNCION: Formulario de inspección de equipos HES (Seguridad en Alturas)
 * IMPLEMENTACION: Valida rubros de inspección, marca OK/Rechazado, envía a API y revalida caché SWR
 * DEPENDENCIAS: React, SWR (useSWRConfig), useMutation hook, apiClient, lucide-react
 * EXPORTS: InspeccionForm (named)
 */
'use client';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useMutation } from '@/hooks/use-mutation';
import { apiClient } from '../../lib/api';
import { Check, X, AlertTriangle } from 'lucide-react';

interface InspeccionItem {
    rubro: string;
    descripcion?: string;
    estado: 'OK' | 'RECHAZADO';
    notas?: string;
}

interface InspeccionFormProps {
    equipoId: string;
    equipoNumero: string;
    ordenId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const RUBROS_DEFAULT = [
    'Cintas / Tejido (Cortes, desgaste, quemaduras)',
    'Costuras (Hilos rotos, sueltos)',
    'Partes Metálicas (Argollas, hebillas - Deformación, corrosión)',
    'Plásticos / Etiquetas (Legibilidad, estado)',
    'Indicadores de Impacto (Activados/No activados)',
];

export function InspeccionForm({
    equipoId,
    equipoNumero,
    ordenId,
    onSuccess,
    onCancel,
}: InspeccionFormProps) {
    const { mutate } = useSWRConfig();
    const [items, setItems] = useState<InspeccionItem[]>(
        RUBROS_DEFAULT.map((rubro) => ({
            rubro,
            estado: 'OK',
        }))
    );

    const mutation = useMutation({
        mutationFn: async () => {
            const payload = {
                equipoId,
                ordenId,
                items: items.map(i => ({
                    rubro: i.rubro,
                    estado: i.estado,
                    notas: i.notas
                })),
                fotosEvidencia: [],
            };

            return apiClient.post('/hes/inspeccion', payload);
        },
        onSuccess: () => {
            // Invalidar caches relacionados
            mutate((key) => typeof key === 'string' && key.startsWith('hes'), undefined, { revalidate: true });
            if (onSuccess) onSuccess();
        },
    });

    const handleItemChange = (index: number, field: keyof InspeccionItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(undefined as never);
    };

    const hasRejected = items.some(i => i.estado === 'RECHAZADO');

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Inspección - Equipo #{equipoNumero}
                </h3>
                <p className="text-sm text-gray-500">
                    Revise cada punto y marque como OK o Rechazado
                </p>
            </div>

            {/* Items de inspección */}
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                            item.estado === 'RECHAZADO'
                                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                {item.rubro}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleItemChange(index, 'estado', 'OK')}
                                    className={`p-2 rounded-full ${
                                        item.estado === 'OK'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                                    }`}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleItemChange(index, 'estado', 'RECHAZADO')}
                                    className={`p-2 rounded-full ${
                                        item.estado === 'RECHAZADO'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                                    }`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {item.estado === 'RECHAZADO' && (
                            <input
                                type="text"
                                placeholder="Notas del rechazo..."
                                value={item.notas || ''}
                                onChange={(e) => handleItemChange(index, 'notas', e.target.value)}
                                className="mt-2 w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-600"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Warning si hay rechazados */}
            {hasRejected && (
                <div className="flex items-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        El equipo será marcado como RECHAZADO y requerirá mantenimiento
                    </span>
                </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={mutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {mutation.isLoading ? 'Guardando...' : 'Guardar Inspección'}
                </button>
            </div>
        </form>
    );
}
