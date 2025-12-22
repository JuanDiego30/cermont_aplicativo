/**
 * @interface IArchivedOrderRepository
 * 
 * Interfaz del repositorio de órdenes archivadas.
 * Define el contrato que debe cumplir cualquier implementación.
 * 
 * Principio: Dependency Inversion (DIP)
 * - El dominio define la interfaz
 * - La infraestructura implementa
 */

import { ArchivedOrderEntity } from '../entities';
import { ArchivedOrderId } from '../value-objects';

export const ARCHIVED_ORDER_REPOSITORY = Symbol('ARCHIVED_ORDER_REPOSITORY');

export interface ArchivedOrderQueryFilters {
    dateFrom?: Date;
    dateTo?: Date;
    reason?: string;
    archivedBy?: string;
    search?: string;
    isArchived?: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface IArchivedOrderRepository {
    /**
     * Guardar o actualizar orden archivada
     */
    save(archivedOrder: ArchivedOrderEntity): Promise<ArchivedOrderEntity>;

    /**
     * Buscar por ID
     */
    findById(id: ArchivedOrderId): Promise<ArchivedOrderEntity | null>;

    /**
     * Buscar por ID de orden original
     */
    findByOrderId(orderId: string): Promise<ArchivedOrderEntity | null>;

    /**
     * Listar con filtros y paginación
     */
    findMany(
        filters: ArchivedOrderQueryFilters,
        page: number,
        pageSize: number,
    ): Promise<PaginatedResult<ArchivedOrderEntity>>;

    /**
     * Contar con filtros
     */
    count(filters: ArchivedOrderQueryFilters): Promise<number>;

    /**
     * Eliminar orden archivada
     */
    delete(id: ArchivedOrderId): Promise<void>;

    /**
     * Verificar si orden ya está archivada
     */
    existsByOrderId(orderId: string): Promise<boolean>;

    /**
     * Obtener estadísticas de archivado
     */
    getStats(): Promise<{
        totalArchived: number;
        byReason: Record<string, number>;
        byMonth: Record<string, number>;
    }>;
}
