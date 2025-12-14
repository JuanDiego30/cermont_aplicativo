/**
 * @module Formularios - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const FormFieldSchema = z.object({
  nombre: z.string(),
  tipo: z.enum(['texto', 'numero', 'fecha', 'select', 'checkbox', 'textarea', 'firma']),
  requerido: z.boolean().default(false),
  opciones: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  validacion: z.record(z.string(), z.unknown()).optional(),
});

export const CreateFormularioSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().optional(),
  categoria: z.enum(['inspeccion', 'mantenimiento', 'seguridad', 'entrega', 'otros']),
  campos: z.array(FormFieldSchema).min(1),
});

export type CreateFormularioDto = z.infer<typeof CreateFormularioSchema>;

export const SubmitFormularioSchema = z.object({
  formularioId: z.string().uuid(),
  ordenId: z.string().uuid().optional(),
  respuestas: z.record(z.string(), z.unknown()),
});

export type SubmitFormularioDto = z.infer<typeof SubmitFormularioSchema>;

export interface FormularioResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  campos: Array<{
    nombre: string;
    tipo: string;
    requerido: boolean;
    opciones?: string[];
  }>;
  createdAt: string;
}

// Repository Interface
export const FORMULARIO_REPOSITORY = Symbol('FORMULARIO_REPOSITORY');

export interface IFormularioRepository {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any>;
  findByCategoria(categoria: string): Promise<any[]>;
  create(data: CreateFormularioDto): Promise<any>;
  submitRespuesta(data: SubmitFormularioDto, userId: string): Promise<any>;
  getRespuestasByOrden(ordenId: string): Promise<any[]>;
}
