/**
 * @file clientes.types.ts
 * @description Types for the clientes (clients) module
 */

export interface Cliente {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    sector?: string;
    nit?: string;
    contactoPrincipal?: string;
    estado: EstadoCliente;
    notas?: string;
    createdAt: string;
    updatedAt: string;
}

export type EstadoCliente = 'activo' | 'inactivo';

export interface ClienteFilters {
    search?: string;
    estado?: EstadoCliente | 'todos';
    sector?: string;
    ciudad?: string;
    page?: number;
    limit?: number;
}

export interface CreateClienteInput {
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    sector?: string;
    nit?: string;
    contactoPrincipal?: string;
    notas?: string;
}

export interface UpdateClienteInput extends Partial<CreateClienteInput> {
    estado?: EstadoCliente;
}

export interface PaginatedClientes {
    data: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ClienteStats {
    total: number;
    activos: number;
    inactivos: number;
    ordenesActivas: number;
}
