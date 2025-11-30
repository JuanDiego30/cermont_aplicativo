import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ArchivedOrder } from '../types';

interface ArchiveDetailModalProps {
    order: ArchivedOrder | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ArchiveDetailModal({ order, isOpen, onClose }: ArchiveDetailModalProps) {
    if (!order) return null;

    const fullData = order.fullData || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>Orden {order.orderNumber}</span>
                        <Badge variant="outline">{order.finalState}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Información General</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-muted-foreground">Cliente:</span>
                                    <p>{order.clientName}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Descripción:</span>
                                    <p>{order.description}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Archivado Por:</span>
                                    <p>{order.archivedBy}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Fecha Archivo:</span>
                                    <p>{format(new Date(order.archivedAt), 'PPpp', { locale: es })}</p>
                                </div>
                            </div>
                        </section>

                        {/* Full Data JSON Dump (Formatted) */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Detalles Completos (JSON)</h3>
                            <div className="bg-muted p-4 rounded-md overflow-x-auto">
                                <pre className="text-xs font-mono">
                                    {JSON.stringify(fullData, null, 2)}
                                </pre>
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
