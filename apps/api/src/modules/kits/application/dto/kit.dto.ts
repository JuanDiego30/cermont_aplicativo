/**
 * @module Kits - Clean Architecture
 */
import { z } from "zod";

// DTOs para creación usando modelo KitTipico de Prisma
export const CreateKitSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().optional(),
  herramientas: z.any().optional(),
  equipos: z.any().optional(),
  documentos: z.array(z.string()).optional(),
  checklistItems: z.array(z.string()).optional(),
  duracionEstimadaHoras: z.number().optional(),
  costoEstimado: z.number().optional(),
  // También soportar items para compatibilidad
  items: z
    .array(
      z.object({
        nombre: z.string(),
        cantidad: z.number().int().min(1),
        unidad: z.string().optional(),
      }),
    )
    .optional(),
  categoria: z.string().optional(),
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
  categoria?: string;
  items?: KitItemData[];
  herramientas?: any;
  equipos?: any;
  createdAt: string;
}

// Repository Interface
export const KIT_REPOSITORY = Symbol("KIT_REPOSITORY");

export interface KitData {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  items?: KitItemData[];
  herramientas?: any;
  equipos?: any;
  documentos?: string[];
  checklistItems?: string[];
  duracionEstimadaHoras?: number;
  costoEstimado?: number;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IKitRepository {
  findAll(): Promise<KitData[]>;
  findById(id: string): Promise<KitData | null>;
  findByCategoria(categoria: string): Promise<KitData[]>;
  create(data: CreateKitDto): Promise<KitData>;
  update(id: string, data: Partial<CreateKitDto>): Promise<KitData>;
  delete(id: string): Promise<void>;
  changeEstado(id: string, activo: boolean): Promise<KitData>;
  // Métodos para aplicar kits a ejecuciones
  applyKitToExecution(kitId: string, ejecucionId: string): Promise<any>;
  syncPredefinedKits(): Promise<any[]>;
}
