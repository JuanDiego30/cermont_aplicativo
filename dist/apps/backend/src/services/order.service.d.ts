import { OrderStatus } from '../utils/constants';
interface CreateOrderDto {
    titulo: string;
    descripcion: string;
    cliente: string;
    ubicacion: string;
    prioridad: 'low' | 'medium' | 'high' | 'critical';
    numeroOrden?: string;
    tipoTrabajo?: string;
    equipo?: string;
    fechaProgramada?: Date;
    horasEstimadas?: number;
    costoEstimado?: number;
    materiales?: Array<{
        nombre: string;
        cantidad: number;
    }>;
    documentos?: string[];
    notas?: string;
    workPlanId?: string;
}
interface UpdateOrderDto {
    titulo?: string;
    descripcion?: string;
    ubicacion?: string;
    prioridad?: 'low' | 'medium' | 'high' | 'critical';
    numeroOrden?: string;
    historial?: any[];
    tipoTrabajo?: string;
    equipo?: string;
    fechaProgramada?: Date;
    horasEstimadas?: number;
    costoEstimado?: number;
    costoReal?: number;
    materiales?: Array<{
        nombre: string;
        cantidad: number;
    }>;
    documentos?: string[];
    notas?: string;
}
interface ListFilters {
    search?: string;
    estado?: OrderStatus;
    prioridad?: string;
    cliente?: string;
    ubicacion?: string;
    asignadoA?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
}
interface ListOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}
interface OrderStats {
    total: number;
    byStatus: Partial<Record<OrderStatus, number>>;
    overdue: number;
    costs: {
        totalEstimado: number;
        totalReal: number;
        promedioCostoEstimado: number;
        promedioCostoReal: number;
    };
}
interface NoteData {
    contenido: string;
}
type UserId = string;
interface IOrderService {
    generateOrderNumber: () => Promise<string>;
    list: (filters?: ListFilters, options?: ListOptions) => Promise<any>;
    getById: (orderId: string) => Promise<any>;
    create: (orderData: CreateOrderDto, userId: UserId) => Promise<any>;
    update: (orderId: string, updateData: UpdateOrderDto, userId: UserId) => Promise<any>;
    assignUsers: (orderId: string, userIds: string[], userId: UserId, supervisorId?: string) => Promise<any>;
    changeStatus: (orderId: string, newStatus: OrderStatus, userId: UserId) => Promise<any>;
    addNote: (orderId: string, nota: NoteData, userId: UserId) => Promise<any>;
    delete: (orderId: string, userId: UserId) => Promise<any>;
    getStats: (filters?: Partial<ListFilters>) => Promise<OrderStats>;
    calculateProgress: (orderId: string) => Promise<number>;
    getUpcomingDeadlines: (daysAhead?: number) => Promise<any[]>;
}
declare class OrderService implements IOrderService {
    generateOrderNumber(): Promise<string>;
    list(filters?: ListFilters, options?: ListOptions): Promise<any>;
    getById(orderId: string): Promise<any>;
    create(orderData: CreateOrderDto, userId: UserId): Promise<any>;
    update(orderId: string, updateData: UpdateOrderDto, userId: UserId): Promise<any>;
    assignUsers(orderId: string, userIds: string[], userId: UserId, supervisorId?: string): Promise<any>;
    changeStatus(orderId: string, newStatus: OrderStatus, userId: UserId): Promise<any>;
    addNote(orderId: string, nota: NoteData, userId: UserId): Promise<any>;
    delete(orderId: string, userId: UserId): Promise<any>;
    getStats(filters?: Partial<ListFilters>): Promise<OrderStats>;
    calculateProgress(orderId: string): Promise<number>;
    getUpcomingDeadlines(daysAhead?: number): Promise<any[]>;
}
declare const _default: OrderService;
export default _default;
export type { IOrderService as OrderService, CreateOrderDto, UpdateOrderDto, ListFilters, ListOptions, OrderStats, NoteData };
//# sourceMappingURL=order.service.d.ts.map