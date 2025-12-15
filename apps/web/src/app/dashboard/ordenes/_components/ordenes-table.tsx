/**
 * ARCHIVO: ordenes-table.tsx
 * FUNCION: Tabla paginada de ordenes de trabajo con estados y acciones
 * IMPLEMENTACION: Tabla HTML con hook useOrdenes, paginacion y badges de estado
 * DEPENDENCIAS: useOrdenes hook, Skeleton, Button, Badge, Next.js Link
 * EXPORTS: OrdenesTable (named)
 */
'use client';
import { useOrdenes } from '@/features/ordenes/hooks/use-ordenes';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

type EstadoOrden = 'SOLICITADA' | 'PLANEADA' | 'EN_EJECUCION' | 'COMPLETADA' | 'FACTURADA' | 'PAGADA' | 'CANCELADA';

interface Orden {
    id: string;
    numero: string;
    cliente?: { nombre: string };
    tipoServicio: string;
    estado: EstadoOrden;
    montoEstimado?: number;
}

const ESTADO_COLORS: Record<EstadoOrden, string> = {
    SOLICITADA: 'info',
    PLANEADA: 'warning',
    EN_EJECUCION: 'warning',
    COMPLETADA: 'success',
    FACTURADA: 'success',
    PAGADA: 'success',
    CANCELADA: 'destructive',
};

export function OrdenesTable() {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useOrdenes({ page, limit: 20 });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border border-red-300 bg-red-50 rounded text-red-600">
                Error al cargar órdenes
            </div>
        );
    }

    const { data: ordenes = [], pagination } = data || {} as { data: Orden[]; pagination?: { total: number; pages: number } };

    return (
        <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-3 text-left font-semibold">Número</th>
                            <th className="px-6 py-3 text-left font-semibold">Cliente</th>
                            <th className="px-6 py-3 text-left font-semibold">Tipo</th>
                            <th className="px-6 py-3 text-left font-semibold">Estado</th>
                            <th className="px-6 py-3 text-left font-semibold">Monto</th>
                            <th className="px-6 py-3 text-left font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.map((orden: Orden) => (
                            <tr key={orden.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-3 font-mono">{orden.numero}</td>
                                <td className="px-6 py-3">{orden.cliente?.nombre}</td>
                                <td className="px-6 py-3">{orden.tipoServicio}</td>
                                <td className="px-6 py-3">
                                    <Badge variant={ESTADO_COLORS[orden.estado] as "info" | "warning" | "success" | "destructive"}>
                                        {orden.estado}
                                    </Badge>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    ${orden.montoEstimado?.toLocaleString('es-CO')}
                                </td>
                                <td className="px-6 py-3">
                                    <Link href={`/dashboard/ordenes/${orden.id}`}>
                                        <Button variant="outline" size="sm">
                                            Ver
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Página {page} de {pagination.pages} ({pagination.total} total)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                            disabled={page === pagination.pages}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
