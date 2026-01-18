/**
 * Kit Model - Sincronizado con backend NestJS
 */

export enum KitEstado {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  ARCHIVADO = 'archivado',
}

export enum KitCategoria {
  HERRAMIENTAS = 'herramientas',
  MATERIALES = 'materiales',
  SEGURIDAD = 'seguridad',
  EQUIPOS = 'equipos',
  OTROS = 'otros',
}

export interface KitItem {
  id: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  categoria?: string;
}

export interface Kit {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: KitCategoria;
  estado: KitEstado;
  esPlantilla: boolean;
  items: KitItem[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateKitDto {
  nombre: string;
  descripcion?: string;
  categoria: KitCategoria;
  esPlantilla?: boolean;
  items?: Omit<KitItem, 'id'>[];
}

export interface UpdateKitDto {
  nombre?: string;
  descripcion?: string;
  categoria?: KitCategoria;
  estado?: KitEstado;
}

export interface AddItemToKitDto {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  categoria?: string;
}

export interface ListKitsQueryDto {
  categoria?: KitCategoria;
  estado?: KitEstado;
  soloPlantillas?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedKits {
  data: Kit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
