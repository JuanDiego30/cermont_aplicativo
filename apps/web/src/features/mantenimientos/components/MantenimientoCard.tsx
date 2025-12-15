/**
 * ARCHIVO: MantenimientoCard.tsx
 * FUNCION: Componente de tarjeta para visualizar un mantenimiento
 * IMPLEMENTACION: Renderiza tipo, estado, fecha y observaciones con colores semánticos
 * DEPENDENCIAS: mantenimiento.types
 * EXPORTS: MantenimientoCard
 */
import { Mantenimiento } from '../types/mantenimiento.types';

interface MantenimientoCardProps {
    mantenimiento: Mantenimiento;
    onClick?: (id: string) => void;
    onView?: () => void;
}

const TYPE_COLORS = {
    preventivo: 'bg-blue-100 text-blue-800',
    correctivo: 'bg-red-100 text-red-800',
    predictivo: 'bg-purple-100 text-purple-800',
};

const STATUS_COLORS = {
    programado: 'bg-gray-100 text-gray-800',
    en_proceso: 'bg-yellow-100 text-yellow-800',
    completado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-50 text-red-600',
};

export function MantenimientoCard({ mantenimiento, onClick, onView }: MantenimientoCardProps) {
    const handleClick = () => {
        if (onView) onView();
        else if (onClick) onClick(mantenimiento.id);
    };

    return (
        <div
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
            onClick={handleClick}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${TYPE_COLORS[mantenimiento.tipo]}`}>
                    {mantenimiento.tipo}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[mantenimiento.estado]}`}>
                    {mantenimiento.estado.replace('_', ' ')}
                </span>
            </div>

            <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Programada</p>
                <p className="font-medium">{new Date(mantenimiento.fechaProgramada).toLocaleDateString()}</p>
            </div>

            {mantenimiento.observaciones && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {mantenimiento.observaciones}
                </p>
            )}

            <div className="mt-3 text-xs text-gray-400">
                <p>Equipos: {mantenimiento.equipos.length}</p>
            </div>
        </div>
    );
}
