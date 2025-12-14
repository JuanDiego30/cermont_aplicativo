/**
 * @module Checklists - Clean Architecture DTOs
 */
import { z } from 'zod';

export const CreateChecklistSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().optional(),
  tipo: z.enum(['seguridad', 'calidad', 'herramientas', 'epp', 'general']),
  items: z.array(z.object({
    descripcion: z.string(),
    requerido: z.boolean().default(true),
    orden: z.number().int().min(0),
  })).min(1),
});

export type CreateChecklistDto = z.infer<typeof CreateChecklistSchema>;

export const ChecklistItemResponseSchema = z.object({
  checklistId: z.string().uuid(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    completado: z.boolean(),
    observaciones: z.string().optional(),
  })),
});

export type ChecklistItemResponseDto = z.infer<typeof ChecklistItemResponseSchema>;

export const ToggleItemSchema = z.object({
  completado: z.boolean(),
  observaciones: z.string().optional(),
});

export type ToggleItemDto = z.infer<typeof ToggleItemSchema>;

export interface ChecklistItemData {
  id: string;
  descripcion: string;
  requerido: boolean;
  orden: number;
  completado?: boolean;
  observaciones?: string;
}

export interface ChecklistResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  items: ChecklistItemData[];
  createdAt: string;
  updatedAt: string;
}

// Interfaz para datos internos del repositorio
export interface ChecklistData {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  activo?: boolean;
  items: ChecklistItemData[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Repository interface
export const CHECKLIST_REPOSITORY = Symbol('CHECKLIST_REPOSITORY');

export interface ItemResponseData {
  itemId: string;
  completado: boolean;
  observaciones?: string;
}

export interface IChecklistRepository {
  findAll(): Promise<ChecklistData[]>;
  findById(id: string): Promise<ChecklistData | null>;
  findByTipo(tipo: string): Promise<ChecklistData[]>;
  create(data: CreateChecklistDto): Promise<ChecklistData>;
  delete(id: string): Promise<void>;
  findByEjecucion(ejecucionId: string): Promise<any[]>;
  createForEjecucion(ejecucionId: string, templateId: string): Promise<any>;
  toggleItem(checklistId: string, itemId: string, data: ToggleItemDto): Promise<ItemResponseData>;
}
