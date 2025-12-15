/**
 * @file orders.service.refactored.ts
 * @description EJEMPLO DE MIGRACIÓN - Servicio de órdenes usando API Factory
 * 
 * Este archivo muestra cómo migrar un servicio CRUD existente
 * para usar el api-resource-factory y reducir código duplicado.
 * 
 * ANTES: ~100 líneas
 * DESPUÉS: ~30 líneas
 * 
 * INSTRUCCIONES DE MIGRACIÓN:
 * 1. Renombrar este archivo a orders.service.ts
 * 2. Eliminar el archivo orders.service.ts original
 * 3. Verificar que todos los imports funcionan correctamente
 * 4. Ejecutar tests
 */

import { createApiResource, extendApiResource, type PaginatedResponse } from '@/lib/api-resource-factory';
import { apiClient } from '@/lib/api-client';
import type { Order, CreateOrderInput, UpdateOrderInput, OrderStatus, OrderPriority } from '@/types/order';

// ============================================================================
// TIPOS DE FILTROS
// ============================================================================

export interface OrderFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: OrderStatus;
    priority?: OrderPriority;
    clientId?: string;
    technicianId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

// ============================================================================
// RESPUESTA PAGINADA (Re-export para compatibilidad)
// ============================================================================

export type PaginatedOrders = PaginatedResponse<Order>;

export interface ListOrdersParams extends OrderFilters {}

// ============================================================================
// SERVICIO REFACTORIZADO
// ============================================================================

/**
 * Servicio base creado con la factory
 * Incluye automáticamente: list, listAll, getById, create, update, patch, delete
 */
const baseOrdersService = createApiResource<Order, CreateOrderInput, UpdateOrderInput, OrderFilters>({
    baseUrl: '/orders',
    resourceName: 'orders',
    isPaginated: true,
});

/**
 * Servicio extendido con métodos específicos de órdenes
 */
export const ordersService = extendApiResource(baseOrdersService, (base) => ({
    /**
     * Cambiar estado de la orden
     */
    changeStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        return apiClient.patch<Order>(`${base.baseUrl}/${id}/status`, { status });
    },

    /**
     * Cambiar prioridad de la orden
     */
    changePriority: async (id: string, priority: OrderPriority): Promise<Order> => {
        return apiClient.patch<Order>(`${base.baseUrl}/${id}/priority`, { priority });
    },

    /**
     * Asignar técnico a la orden
     */
    assignTechnician: async (id: string, technicianId: string): Promise<Order> => {
        return apiClient.patch<Order>(`${base.baseUrl}/${id}/technician`, { technicianId });
    },

    /**
     * Obtener estadísticas de órdenes
     */
    getStats: async (): Promise<{
        total: number;
        byStatus: Record<OrderStatus, number>;
        byPriority: Record<OrderPriority, number>;
        completedThisMonth: number;
        pendingCount: number;
    }> => {
        return apiClient.get(`${base.baseUrl}/stats`);
    },

    /**
     * Exportar órdenes a Excel
     */
    exportToExcel: async (filters?: OrderFilters): Promise<Blob> => {
        const stringFilters: Record<string, string> = {};
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    stringFilters[key] = String(value);
                }
            });
        }
        return apiClient.getBlob(`${base.baseUrl}/export`, stringFilters);
    },
}));

// ============================================================================
// COMPARACIÓN: ANTES vs DESPUÉS
// ============================================================================

/*
ANTES (100+ líneas):
--------------------
export const ordersService = {
    list: async (params?: ListOrdersParams): Promise<PaginatedOrders> => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }
        const query = queryParams.toString();
        return apiClient.get<PaginatedOrders>(`/orders${query ? `?${query}` : ''}`);
    },

    getById: async (id: string): Promise<Order> => {
        return apiClient.get<Order>(`/orders/${id}`);
    },

    create: async (data: CreateOrderInput): Promise<Order> => {
        return apiClient.post<Order>('/orders', data);
    },

    update: async (id: string, data: UpdateOrderInput): Promise<Order> => {
        return apiClient.patch<Order>(`/orders/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/orders/${id}`);
    },

    changeStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        return apiClient.patch<Order>(`/orders/${id}/status`, { status });
    },

    changePriority: async (id: string, priority: OrderPriority): Promise<Order> => {
        return apiClient.patch<Order>(`/orders/${id}/priority`, { priority });
    },

    getStats: async (): Promise<...> => {
        return apiClient.get('/orders/stats');
    },

    assignTechnician: async (id: string, technicianId: string): Promise<Order> => {
        return apiClient.patch<Order>(`/orders/${id}/technician`, { technicianId });
    },
};

DESPUÉS (30 líneas para lo mismo + métodos extra):
--------------------------------------------------
Ver código arriba. La factory maneja automáticamente:
- list con paginación y filtros
- listAll sin paginación
- getById
- create
- update (PUT)
- patch (PATCH)
- delete

Solo necesitas agregar métodos específicos del dominio.
*/
