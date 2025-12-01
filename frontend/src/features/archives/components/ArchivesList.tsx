import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Badge,
} from '@/shared/components/ui';
import { Eye, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ArchivedOrder } from '../types';
import { SkeletonTable } from '@/components/common/Skeleton';

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

interface ArchivesListProps {
    orders: ArchivedOrder[];
    isLoading: boolean;
    onViewDetail: (order: ArchivedOrder) => void;
}

export function ArchivesList({ orders, isLoading, onViewDetail }: ArchivesListProps) {
    if (isLoading) {
        return <SkeletonTable rows={5} columns={6} />;
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-10 text-center dark:border-gray-800">
                <Inbox className="mb-3 h-10 w-10 text-gray-400" aria-hidden="true" />
                <p className="text-base font-medium text-gray-900 dark:text-white">No hay resultados</p>
                <p className="text-sm text-muted-foreground">
                    Ajusta los filtros o selecciona otro mes para visualizar archivos.
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Orden</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado Final</TableHead>
                        <TableHead>Fecha Archivo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{order.clientName}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{order.description}</TableCell>
                            <TableCell>
                                <Badge variant="light" color={getBadgeColor(order.finalState)}>
                                    {order.finalState}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(order.archivedAt), 'PP', { locale: es })}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewDetail(order)}
                                    aria-label={`Ver detalle de la orden ${order.orderNumber}`}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function getBadgeColor(state: string): BadgeColor {
    const normalized = state?.toUpperCase() ?? '';
    if (normalized.includes('FINAL') || normalized.includes('COMPLE')) return 'success';
    if (normalized.includes('CANCEL')) return 'error';
    if (normalized.includes('PEND')) return 'warning';
    if (normalized.includes('REVISION') || normalized.includes('REV')) return 'info';
    return 'light';
}
