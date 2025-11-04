import { ORDER_STATUS } from '';
type OrderStatus = typeof ORDER_STATUS[number];
interface ArchiveOptions {
    reason?: string;
    notify?: boolean;
}
interface ArchivedFilters {
    page?: number;
    limit?: number;
    search?: string;
    estado?: OrderStatus;
    assignedTo?: string;
}
interface ArchiveResult {
    orders: Array<Pick<OrderDocument, 'numeroOrden' | 'descripcion' | 'estado' | 'fechaInicio' | 'fechaFinReal' | 'asignadoA' | 'supervisorId' | 'historial' | 'isArchived'>>;
    total: number;
    pages: number;
    page: number;
    limit: number;
}
interface BulkResult {
    modifiedCount: number;
    matchedCount: number;
}
interface PurgeResult {
    deletedCount: number;
}
export declare const archiveOrder: (orderId: string, userId: string, options?: ArchiveOptions) => Promise<OrderDocument>;
export declare const unarchiveOrder: (orderId: string, userId: string, options?: ArchiveOptions) => Promise<OrderDocument>;
export declare const getArchivedOrders: (filters?: ArchivedFilters) => Promise<ArchiveResult>;
export declare const autoArchiveOldOrders: (daysOld?: number, status?: OrderStatus) => Promise<BulkResult>;
export declare const purgeArchivedOrders: (daysOld?: number) => Promise<PurgeResult>;
export {};
//# sourceMappingURL=archiving.service.d.ts.map