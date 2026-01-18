/**
 * Customer DTOs - Shared between Backend and Frontend
 */

export enum CustomerType {
  PETROLERO = 'petrolero',
  INDUSTRIAL = 'industrial',
  COMERCIAL = 'comercial',
  RESIDENCIAL = 'residencial',
  GOBIERNO = 'gobierno',
  OTRO = 'otro',
}

export interface CustomerContactInfo {
  id?: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono?: string;
  esPrincipal: boolean;
}

export interface CustomerLocationInfo {
  id?: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  esPrincipal: boolean;
}

export interface CreateContactDto {
  nombre: string;
  cargo: string;
  email: string;
  telefono?: string;
  esPrincipal?: boolean;
}

export interface CreateLocationDto {
  nombre: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  esPrincipal?: boolean;
}

export interface CreateCustomerDto {
  razonSocial: string;
  nit: string;
  tipoCliente: CustomerType;
  direccion?: string;
  telefono?: string;
  email?: string;
  contactos?: CreateContactDto[];
  ubicaciones?: CreateLocationDto[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CustomersQueryDto {
  activo?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface CustomerResponseDto {
  id: string;
  razonSocial: string;
  nit: string;
  tipoCliente: CustomerType;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  contactos: CustomerContactInfo[];
  ubicaciones: CustomerLocationInfo[];
  totalOrdenes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerOrderSummaryDto {
  id: string;
  numero: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  createdAt: string;
  fechaFin?: string | null;
}

export interface CustomerOrdersResponseDto {
  clienteId: string;
  razonSocial: string;
  totalOrdenes: number;
  orders: CustomerOrderSummaryDto[];
}

export interface PaginatedCustomers {
  data: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
