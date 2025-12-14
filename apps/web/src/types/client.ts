/**
 * ARCHIVO: client.ts
 * FUNCION: Define tipos para gestión de clientes
 * IMPLEMENTACION: Interfaces para Client, ClientCreate, ClientUpdate y filtros
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: Client, ClientCreate, ClientUpdate, ClientFilters
 */
export interface Client {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  nit?: string;
  contacto?: string;
  activo: boolean;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreate {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  nit?: string;
  contacto?: string;
  notas?: string;
}

export interface ClientUpdate extends Partial<ClientCreate> {
  activo?: boolean;
}

export interface ClientFilters {
  search?: string;
  activo?: boolean;
}
