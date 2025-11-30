export interface ArchiveLog {
    id: string;
    orderId: string;
    orderNumber: string;
    action: 'ARCHIVED' | 'RESTORED' | 'DELETED';
    performedBy: string;
    details?: string;
    createdAt: string;
}

export interface ArchivedOrder {
    id: string;
    originalId: string;
    orderNumber: string;
    clientName: string;
    description: string;
    finalState: string;
    fullData: any; // JSON with full order details
    archivedBy: string;
    archivedAt: string;
}

export interface ArchiveFilters {
    page?: number;
    limit?: number;
    month?: string; // YYYY-MM
    search?: string;
}
