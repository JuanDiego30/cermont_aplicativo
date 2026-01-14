/**
 * @module Planeacion - Clean Architecture
 * @description DTOs, Repository Interface, Use Cases, Repository Implementation, Controller y Module
 */
import { z } from "zod";

// ==================== DTOs ====================
export const CreatePlaneacionSchema = z.object({
  cronograma: z.record(z.string(), z.unknown()).optional().default({}),
  manoDeObra: z.record(z.string(), z.unknown()).optional().default({}),
  observaciones: z.string().optional(),
  kitId: z.string().uuid().optional(),
});

export type CreatePlaneacionDto = z.infer<typeof CreatePlaneacionSchema>;

export const AprobarPlaneacionSchema = z.object({
  observaciones: z.string().optional(),
});

export type AprobarPlaneacionDto = z.infer<typeof AprobarPlaneacionSchema>;

export const RechazarPlaneacionSchema = z.object({
  motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
});

export type RechazarPlaneacionDto = z.infer<typeof RechazarPlaneacionSchema>;

// Response Types
export interface PlaneacionResponse {
  id: string;
  ordenId: string;
  estado: string;
  cronograma: Record<string, unknown>;
  manoDeObra: Record<string, unknown>;
  observaciones?: string;
  aprobadoPorId?: string;
  fechaAprobacion?: string;
  createdAt: string;
  updatedAt: string;
}
