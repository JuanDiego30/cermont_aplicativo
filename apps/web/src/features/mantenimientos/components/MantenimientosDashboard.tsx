
'use client';

import { DashboardTemplate, ColumnConfig } from '@/components/shared/DashboardTemplate';
import type { Mantenimiento } from '../types/mantenimiento.types';
import { formatFecha, formatEstado, formatPrioridad } from '@/lib/utils/formatters';

const columns: ColumnConfig<Mantenimiento>[] = [
    { key: 'titulo', label: 'Título' },
    { key: 'tipo', label: 'Tipo' },
    {
        key: 'fechaProgramada',
        label: 'Fecha Programada',
        render: (value) => formatFecha(value as string)
    },
    {
        key: 'estado',
        label: 'Estado',
        render: (value) => formatEstado(value as string)
    },
    {
        key: 'prioridad',
        label: 'Prioridad',
        render: (value) => formatPrioridad(value as string)
    },
    {
        key: 'tecnicoAsignado',
        label: 'Técnico',
        render: (value: any) => value?.name || 'Sin asignar'
    }
];

export function MantenimientosDashboard() {
    return (
        <DashboardTemplate<Mantenimiento>
            title="Mantenimientos"
            subtitle="Gestión de mantenimientos preventivos y correctivos"
            apiEndpoint="/mantenimientos"
            columns={columns}
            renderForm={(onClose: () => void, item?: Mantenimiento) => (
                <div className="p-4">
                    <h2>Formulario Mantenimiento (TODO)</h2>
                    <button onClick={onClose}>Cerrar</button>
                </div>
            )}
        />
    );
}
