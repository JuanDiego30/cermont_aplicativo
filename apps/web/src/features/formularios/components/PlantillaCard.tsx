/**
 * ARCHIVO: PlantillaCard.tsx
 * FUNCION: Card presentacional para mostrar plantilla de formulario
 * IMPLEMENTACION: Muestra nombre, descripción, estado, conteo de campos y acciones
 * DEPENDENCIAS: formulario.types, formulario.utils (ESTADO_CONFIG)
 * EXPORTS: PlantillaCard
 */
import { Plantilla } from '../types/formulario.types';
import { ESTADO_FORMULARIO_CONFIG } from '../utils/formulario.utils';

interface PlantillaCardProps {
    plantilla: Plantilla;
    onView?: () => void;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onStats?: () => void;
}

export function PlantillaCard({ plantilla, onView, onEdit, onDuplicate, onDelete, onStats }: PlantillaCardProps) {
    const estadoConfig = ESTADO_FORMULARIO_CONFIG[plantilla.estado] || { label: plantilla.estado, color: 'gray' };

    return (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate" title={plantilla.nombre}>
                    {plantilla.nombre}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full bg-${estadoConfig.color}-100 text-${estadoConfig.color}-800`}>
                    {estadoConfig.label}
                </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10 mb-4">
                {plantilla.descripcion || 'Sin descripción'}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                <span>{plantilla.campos.length} campos</span>
                <span>•</span>
                <span>{plantilla.totalRespuestas || 0} respuestas</span>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                {onStats && (
                    <button onClick={onStats} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Estadísticas">
                        📊
                    </button>
                )}
                {onDuplicate && (
                    <button onClick={onDuplicate} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Duplicar">
                        📋
                    </button>
                )}
                {onEdit && (
                    <button onClick={onEdit} className="p-1 hover:bg-blue-50 rounded text-blue-600" title="Editar">
                        ✏️
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete} className="p-1 hover:bg-red-50 rounded text-red-600" title="Eliminar">
                        🗑️
                    </button>
                )}
            </div>
        </div>
    );
}
