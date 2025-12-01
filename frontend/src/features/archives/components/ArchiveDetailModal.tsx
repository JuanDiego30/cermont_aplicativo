import React from 'react';
import { Modal, Badge } from '@/shared/components/ui';
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
        <Modal isOpen={isOpen} onClose={onClose} title={`Orden ${order.orderNumber}`} size="lg">
            <div className="flex items-center gap-2 mb-4">
                <Badge variant="light">{order.finalState}</Badge>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-4">
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
            </div>
        </Modal>
    );
}
