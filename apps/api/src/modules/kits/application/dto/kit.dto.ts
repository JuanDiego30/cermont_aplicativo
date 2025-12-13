/**
 * @module Kits - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const CreateKitSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().optional(),
  categoria: z.enum(['electrico', 'mecanico', 'seguridad', 'herramientas', 'general']),
  items: z.array(z.object({
    nombre: z.string(),
    cantidad: z.number().int().min(1),
    unidad: z.string().optional(),
  })).min(1),
});

export type CreateKitDto = z.infer<typeof CreateKitSchema>;

export interface KitItemData {
  id: string;
  nombre: string;
  cantidad: number;
  unidad?: string;
}

export interface KitResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  items: KitItemData[];
  createdAt: string;
}

// Repository Interface
export const KIT_REPOSITORY = Symbol('KIT_REPOSITORY');

export interface KitData {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  items: KitItemData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IKitRepository {
  findAll(): Promise<KitData[]>;
  findById(id: string): Promise<KitData | null>;
  findByCategoria(categoria: string): Promise<KitData[]>;
  create(data: CreateKitDto): Promise<KitData>;
  delete(id: string): Promise<void>;
}
