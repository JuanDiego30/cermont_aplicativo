import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    equipoNumero: string; // Para mostrar en el título
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
    const queryClient = useQueryClient();
    const [items, setItems] = useState<InspeccionItem[]>(
        RUBROS_DEFAULT.map((rubro) => ({
            rubro,
            estado: 'OK',
        }))
    );
    const [_fotos, _setFotos] = useState<File[]>([]);
    const [_observaciones, _setObservaciones] = useState('');

    const mutation = useMutation({
        mutationFn: async (_data: any) => {
            // Primero subir fotos si hay (simulado o futura implementación)
            // Por ahora enviamos URLs simuladas o base64 si fuera pequeño, 
            // pero idealmente se suben a /upload y se envían URLs.
            // Asumiremos que el backend espera URLs en string[].

            const payload = {
                equipoId,
                ordenId,
                items: items.map(i => ({
                    rubro: i.rubro,
                    estado: i.estado,
                    notas: i.notas
                })),
                fotosEvidencia: [], // Implementar subida real
            };

            return apiClient.post('/hes/inspeccion', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hes-inspecciones'] });
            queryClient.invalidateQueries({ queryKey: ['hes-equipos'] });
            if (onSuccess) onSuccess();
        },
    });

    const handleItemChange = (index: number, field: keyof InspeccionItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({});
    };

    const allOk = items.every((i) => i.estado === 'OK');

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Inspección Pre-operacional HES
                </h2>
                <span className="text-sm text-gray-500">Equipo: {equipoNumero}</span>
            </div>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-md border ${item.estado === 'OK'
                                ? 'border-gray-200 dark:border-gray-700'
                                : 'border-red-300 bg-red-50 dark:bg-red-900/10'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {item.rubro}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleItemChange(idx, 'estado', 'OK')}
                                    className={`p-2 rounded-full ${item.estado === 'OK'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleItemChange(idx, 'estado', 'RECHAZADO')}
                                    className={`p-2 rounded-full ${item.estado === 'RECHAZADO'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {item.estado === 'RECHAZADO' && (
                            <textarea
                                placeholder="Describa el defecto..."
                                value={item.notas || ''}
                                onChange={(e) => handleItemChange(idx, 'notas', e.target.value)}
                                className="w-full mt-2 p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600"
                                rows={2}
                                required
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-full ${allOk ? 'bg-green-100' : 'bg-red-100'}`}>
                        {allOk ? <Check className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            Resultado: {allOk ? 'APROBADO' : 'RECHAZADO'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {allOk ? 'El equipo está apto para su uso.' : 'El equipo debe ser retirado de servicio.'}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.status === 'pending'}
                        className={`px-4 py-2 text-white rounded-md ${mutation.status === 'pending'
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {mutation.status === 'pending' ? 'Enviando...' : 'Guardar Inspección'}
                    </button>
                </div>
            </div>
            {mutation.isError && (
                <div className="text-red-500 text-sm mt-2 text-center">
                    Error al guardar la inspección. Intente nuevamente.
                </div>
            )}
        </form>
    );
}
