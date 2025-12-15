/**
 * ARCHIVO: EvidenciaCard.tsx
 * FUNCION: Componente presentacional para mostrar una evidencia individual
 * IMPLEMENTACION: Card con preview de imagen/tipo, overlay de acciones hover
 * DEPENDENCIAS: evidencia.types
 * EXPORTS: EvidenciaCard
 */
import { Evidencia } from '../types/evidencia.types';

interface EvidenciaCardProps {
    evidencia: Evidencia;
    onDelete?: (id: string) => void;
    onView?: (url: string) => void;
}

export function EvidenciaCard({ evidencia, onDelete, onView }: EvidenciaCardProps) {
    // Config per type (could be extracted to config file if complex)
    const isImage = evidencia.tipo === 'foto';

    return (
        <div className="group relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                {isImage ? (
                    <img
                        src={evidencia.url}
                        alt={evidencia.descripcion || 'Evidencia'}
                        className="w-full h-full object-cover"
                        onClick={() => onView?.(evidencia.url)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        {/* Simple icon placeholder */}
                        <span className="uppercase font-bold text-sm tracking-wider">
                            {evidencia.tipo}
                        </span>
                    </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {onView && (
                        <button
                            onClick={() => onView(evidencia.url)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
                            title="Ver"
                        >
                            <span className="sr-only">Ver</span>
                            👁️
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(evidencia.id)}
                            className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-full backdrop-blur-sm"
                            title="Eliminar"
                        >
                            <span className="sr-only">Eliminar</span>
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <div className="p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate" title={evidencia.descripcion}>
                    {evidencia.descripcion || 'Sin descripción'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {new Date(evidencia.fechaSubida).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
