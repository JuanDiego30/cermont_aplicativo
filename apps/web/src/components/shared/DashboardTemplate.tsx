/**
 * @component DashboardTemplate
 * @description Reusable dashboard page template
 * Eliminates ~600 lines of duplicate page code across 6+ modules
 */
'use client';

import { useState, useCallback, ReactNode } from 'react';
import { RefreshCw, Plus, Search, Filter, X } from 'lucide-react';
import { useFetch } from '../../lib/hooks/useFetch';
import { useFilters } from '../../lib/hooks/useFilters';
import { usePagination } from '../../lib/hooks/usePagination';

// =============================================
// Types
// =============================================

export interface ColumnConfig<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, row: T) => ReactNode;
    sortable?: boolean;
    width?: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'dateRange';
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface DashboardTemplateProps<T> {
    // Required
    title: string;
    apiEndpoint: string;
    columns: ColumnConfig<T>[];

    // Optional
    subtitle?: string;
    icon?: ReactNode;
    filters?: FilterConfig[];
    showSearch?: boolean;
    searchPlaceholder?: string;

    // Actions
    onNew?: () => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => Promise<void>;
    onRowClick?: (item: T) => void;

    // Custom rendering
    renderActions?: (item: T) => ReactNode;
    renderEmptyState?: () => ReactNode;
    renderHeader?: () => ReactNode;
    renderForm?: (onClose: () => void, item?: T) => ReactNode;

    // Data transform
    transformData?: (data: any) => T[];

    // Pagination
    pageSize?: number;
}

// =============================================
// Component
// =============================================

export function DashboardTemplate<T extends { id: string }>({
    title,
    subtitle,
    icon,
    apiEndpoint,
    columns,
    filters: filterConfig = [],
    showSearch = true,
    searchPlaceholder = 'Buscar...',
    onNew,
    onEdit,
    onDelete,
    onRowClick,
    renderActions,
    renderEmptyState,
    renderHeader,
    renderForm,
    transformData,
    pageSize = 10,
}: DashboardTemplateProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | undefined>(undefined);

    // Initialize filters
    const initialFilters: Record<string, any> = {};
    filterConfig.forEach(f => { initialFilters[f.key] = ''; });

    const { filters, setFilter, resetFilters, hasActiveFilters, activeFilterCount } = useFilters({
        initialFilters,
        syncToUrl: true,
    });

    // Build query string
    const queryString = Object.entries({ ...filters, search: searchQuery })
        .filter(([_, v]) => v !== '' && v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&');

    // Fetch data
    const { data: rawData, loading, error, refetch } = useFetch<any>(
        `${apiEndpoint}${queryString ? `?${queryString}` : ''}`,
    );

    // Transform data
    const items: T[] = transformData
        ? transformData(rawData)
        : (Array.isArray(rawData) ? rawData : rawData?.data || []);

    const total = rawData?.total || items.length;

    // Pagination
    const pagination = usePagination({
        totalItems: total,
        initialPageSize: pageSize,
    });

    const paginatedItems = pagination.getPageData(items);

    // Handlers
    const handleNew = () => {
        setSelectedItem(undefined);
        if (onNew) onNew();
        else setShowForm(true);
    };

    const handleEdit = (item: T) => {
        setSelectedItem(item);
        if (onEdit) onEdit(item);
        else setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedItem(undefined);
        refetch();
    };

    // Handle delete
    const handleDelete = useCallback(async (item: T) => {
        if (onDelete && confirm('¿Está seguro de eliminar este registro?')) {
            await onDelete(item);
            refetch();
        }
    }, [onDelete, refetch]);

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Refrescar"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {(onNew || renderForm) && (
                        <button
                            onClick={handleNew}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo
                        </button>
                    )}
                </div>
            </div>

            {renderHeader?.()}

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                {showSearch && (
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {filterConfig.length > 0 && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${hasActiveFilters
                            ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        {activeFilterCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && filterConfig.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Filtros</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filterConfig.map((filter) => (
                            <div key={filter.key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {filter.label}
                                </label>
                                {filter.type === 'select' ? (
                                    <select
                                        value={filters[filter.key] || ''}
                                        onChange={(e) => setFilter(filter.key, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    >
                                        <option value="">Todos</option>
                                        {filter.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={filter.type}
                                        value={filters[filter.key] || ''}
                                        onChange={(e) => setFilter(filter.key, e.target.value)}
                                        placeholder={filter.placeholder}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                    Error al cargar datos: {error.message}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
                renderEmptyState?.() || (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <p>No se encontraron registros</p>
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="mt-2 text-blue-600 hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )
            )}

            {/* Data Table */}
            {!loading && items.length > 0 && (
                <>
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={String(col.key)}
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                            style={{ width: col.width }}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                    {(onEdit || onDelete || renderActions || renderForm) && (
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => onRowClick?.(item)}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                    >
                                        {columns.map((col) => (
                                            <td key={String(col.key)} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                {col.render
                                                    ? col.render((item as any)[col.key], item)
                                                    : String((item as any)[col.key] ?? '-')}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || renderActions || renderForm) && (
                                            <td className="px-4 py-3 text-sm text-right space-x-2">
                                                {renderActions?.(item) || (
                                                    <>
                                                        {(onEdit || renderForm) && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Editar
                                                            </button>
                                                        )}
                                                        {onDelete && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4">
                            <p className="text-sm text-gray-500">
                                Mostrando {pagination.startIndex + 1} - {pagination.endIndex} de {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={pagination.prevPage}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                {pagination.pageNumbers.map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => pagination.goToPage(page)}
                                        className={`px-3 py-1 rounded ${page === pagination.currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'border hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={pagination.nextPage}
                                    disabled={!pagination.hasNextPage}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Form Modal Overlay */}
            {showForm && renderForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold dark:text-white">
                                    {selectedItem ? 'Editar Registro' : 'Nuevo Registro'}
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {renderForm(handleCloseForm, selectedItem)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
