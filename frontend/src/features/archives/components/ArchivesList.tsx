import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ArchivedOrder } from '../types';

interface ArchivesListProps {
    orders: ArchivedOrder[];
    isLoading: boolean;
    onViewDetail: (order: ArchivedOrder) => void;
}

export function ArchivesList({ orders, isLoading, onViewDetail }: ArchivesListProps) {
    if (isLoading) {
        return <div className="p-8 text-center">Cargando archivos...</div>;
    }

    if (orders.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No se encontraron órdenes archivadas.</div>;
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
                            <TableCell>{order.finalState}</TableCell>
                            <TableCell>{format(new Date(order.archivedAt), 'PP', { locale: es })}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewDetail(order)}
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
