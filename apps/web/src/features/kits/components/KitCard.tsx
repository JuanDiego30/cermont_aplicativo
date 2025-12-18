
import { Calendar, Clock, PenTool, Shield, FileText, CheckSquare, MoreVertical, Play, Edit, Power } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { type Kit } from '../index';

interface KitCardProps {
    kit: Kit;
    onEdit?: (kit: Kit) => void;
    onChangeEstado?: (id: string, estado: string) => void;
    onApply?: (kit: Kit) => void;
    onView?: () => void;
}

export function KitCard({ kit, onEdit, onChangeEstado, onApply, onView }: KitCardProps) {
    const isActive = kit.activo;

    return (
        <div className={`
      relative group rounded-xl border p-5 transition-all
      ${isActive
                ? 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg'
                : 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 opacity-75'
            }
    `}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div
                    onClick={onView}
                    className={`cursor-pointer ${onView ? 'hover:opacity-80' : ''}`}
                >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {kit.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                        {kit.descripcion}
                    </p>
                </div>

                <Menu as="div" className="relative">
                    <Menu.Button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                        <MoreVertical className="w-4 h-4" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-10 focus:outline-none">
                        {onApply && isActive && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => onApply(kit)}
                                        className={`${active ? 'bg-purple-50 text-purple-600' : 'text-gray-700 dark:text-gray-300'} flex w-full items-center px-4 py-2 text-sm gap-2`}
                                    >
                                        <Play className="w-4 h-4" />
                                        Usar este Kit
                                    </button>
                                )}
                            </Menu.Item>
                        )}

                        {onEdit && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => onEdit(kit)}
                                        className={`${active ? 'bg-gray-50' : 'text-gray-700 dark:text-gray-300'} flex w-full items-center px-4 py-2 text-sm gap-2`}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Plantilla
                                    </button>
                                )}
                            </Menu.Item>
                        )}

                        {onChangeEstado && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => onChangeEstado(kit.id, isActive ? 'inactivo' : 'activo')}
                                        className={`${active ? 'bg-red-50 text-red-600' : 'text-gray-700 dark:text-gray-300'} flex w-full items-center px-4 py-2 text-sm gap-2`}
                                    >
                                        <Power className="w-4 h-4" />
                                        {isActive ? 'Desactivar' : 'Activar'}
                                    </button>
                                )}
                            </Menu.Item>
                        )}
                    </Menu.Items>
                </Menu>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>{kit.duracionEstimadaHoras}h estimadas</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                    <FileText className="w-3 h-3 text-purple-500" />
                    <span>{kit.documentos?.length || 0} docs</span>
                </div>
            </div>

            {/* Content Summary */}
            <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <PenTool className="w-3 h-3" />
                        Herramientas
                    </span>
                    <span className="font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                        {kit.herramientas?.length || 0}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Shield className="w-3 h-3" />
                        Equipos Seguridad
                    </span>
                    <span className="font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                        {kit.equipos?.length || 0}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <CheckSquare className="w-3 h-3" />
                        Actividades
                    </span>
                    <span className="font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                        {kit.checklistItems?.length || 0}
                    </span>
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs font-medium text-gray-500 capitalize">
                    {isActive ? 'Disponible' : 'Inactivo'}
                </span>
            </div>
        </div>
    );
}

export function KitCardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-200 p-5 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-8 bg-gray-100 rounded" />
                <div className="h-8 bg-gray-100 rounded" />
            </div>
            <div className="space-y-2 pt-3">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
        </div>
    );
}
