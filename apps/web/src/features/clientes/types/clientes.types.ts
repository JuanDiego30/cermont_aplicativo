/**
 * ARCHIVO: clientes.types.ts
 * FUNCION: Definiciones de tipos TypeScript para el módulo de clientes
 * IMPLEMENTACION: Interfaces y tipos para entidad Cliente, filtros, inputs y respuestas
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: Cliente, EstadoCliente, ClienteFilters, CreateClienteInput, UpdateClienteInput, etc.
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
