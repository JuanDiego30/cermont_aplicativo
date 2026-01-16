import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

// Cliente models
export interface Cliente {
  id: string;
  nombre: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  contactos?: Contacto[];
  ubicaciones?: Ubicacion[];
  createdAt: string;
  updatedAt: string;
}

export interface Contacto {
  id: string;
  nombre: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  principal: boolean;
}

export interface Ubicacion {
  id: string;
  nombre: string;
  direccion: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
}

export interface CreateClienteDto {
  nombre: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface CreateContactoDto {
  nombre: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  principal?: boolean;
}

export interface CreateUbicacionDto {
  nombre: string;
  direccion: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
}

export interface ClienteOrdenesResponse {
  clienteId: string;
  razonSocial: string;
  totalOrdenes: number;
  orders: any[]; // Use Order type if imported
}

@Injectable({
  providedIn: 'root',
})
export class CustomersApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  /**
   * List all clients
   */
  list(activo?: boolean): Observable<Cliente[]> {
    let params = new HttpParams();
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    return this.http.get<Cliente[]>(this.apiUrl, { params });
  }

  /**
   * Get client by ID
   */
  getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new client
   */
  create(data: CreateClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, data);
  }

  /**
   * Add contact to client
   */
  addContacto(clienteId: string, data: CreateContactoDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/${clienteId}/contacts`, data);
  }

  /**
   * Add location to client
   */
  addUbicacion(clienteId: string, data: CreateUbicacionDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/${clienteId}/locations`, data);
  }

  /**
   * Get client orders history
   */
  getOrdenes(clienteId: string): Observable<ClienteOrdenesResponse> {
    return this.http.get<ClienteOrdenesResponse>(`${this.apiUrl}/${clienteId}/orders`);
  }

  /**
   * Deactivate client
   */
  desactivar(id: string): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.apiUrl}/${id}`);
  }
}
