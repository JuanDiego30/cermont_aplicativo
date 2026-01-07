/**
 * ClientesApi - Clients/Customers API Client
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Manages client CRUD operations, contacts, and locations.
 * 
 * @see apps/api/src/modules/clientes/clientes.controller.ts
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

// ============================================
// DTOs aligned with backend
// ============================================

export interface Contacto {
    id: string;
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    principal: boolean;
}

export interface Ubicacion {
    id: string;
    nombre: string;
    direccion: string;
    ciudad: string;
    departamento?: string;
    codigoPostal?: string;
    latitud?: number;
    longitud?: number;
    principal: boolean;
}

export interface Cliente {
    id: string;
    nombre: string;
    nit: string;
    razonSocial?: string;
    sector?: string;
    activo: boolean;
    contactos: Contacto[];
    ubicaciones: Ubicacion[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateClienteDto {
    nombre: string;
    nit: string;
    razonSocial?: string;
    sector?: string;
}

export interface CreateContactoDto {
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    principal?: boolean;
}

export interface CreateUbicacionDto {
    nombre: string;
    direccion: string;
    ciudad: string;
    departamento?: string;
    codigoPostal?: string;
    latitud?: number;
    longitud?: number;
    principal?: boolean;
}

// ============================================
// ClientesApi Service
// ============================================

@Injectable({
    providedIn: 'root'
})
export class ClientesApi extends ApiBaseService {
    private readonly basePath = '/clientes';

    /**
     * GET /clientes - List all clients
     */
    list(activo?: boolean): Observable<Cliente[]> {
        const params = activo !== undefined ? { activo } : undefined;
        return this.get<Cliente[]>(this.basePath, params as Record<string, unknown>);
    }

    /**
     * GET /clientes/:id - Get client by ID
     */
    getById(id: string): Observable<Cliente> {
        return this.get<Cliente>(`${this.basePath}/${id}`);
    }

    /**
     * POST /clientes - Create new client
     */
    create(dto: CreateClienteDto): Observable<Cliente> {
        return this.post<Cliente>(this.basePath, dto);
    }

    /**
     * POST /clientes/:id/contactos - Add contact to client
     */
    addContacto(clienteId: string, dto: CreateContactoDto): Observable<Cliente> {
        return this.post<Cliente>(`${this.basePath}/${clienteId}/contactos`, dto);
    }

    /**
     * POST /clientes/:id/ubicaciones - Add location to client
     */
    addUbicacion(clienteId: string, dto: CreateUbicacionDto): Observable<Cliente> {
        return this.post<Cliente>(`${this.basePath}/${clienteId}/ubicaciones`, dto);
    }

    /**
     * GET /clientes/:id/ordenes - Get client's order history
     */
    getOrdenes(clienteId: string): Observable<unknown[]> {
        return this.get<unknown[]>(`${this.basePath}/${clienteId}/ordenes`);
    }

    /**
     * DELETE /clientes/:id - Deactivate client
     */
    desactivar(id: string): Observable<Cliente> {
        return this.deleteRequest<Cliente>(`${this.basePath}/${id}`);
    }
}
