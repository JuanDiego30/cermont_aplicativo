/**
 * @module Cierre-Administrativo - Clean Architecture
 */
import { z } from "zod";

// DTOs
export const CierreDocumentoSchema = z.object({
  tipo: z.enum(["acta", "ses", "factura", "otros"]),
  numero: z.string().optional(),
  fechaDocumento: z.string(),
  observaciones: z.string().optional(),
});

export type CierreDocumentoDto = z.infer<typeof CierreDocumentoSchema>;

export const CreateCierreSchema = z.object({
  ordenId: z.string().uuid(),
  documentos: z.array(CierreDocumentoSchema).min(1),
  observacionesGenerales: z.string().optional(),
});

export type CreateCierreDto = z.infer<typeof CreateCierreSchema>;

export interface CierreDocumentoResponse {
  id: string;
  tipo: string;
  numero?: string;
  fechaDocumento: string;
  url?: string;
  estado: string;
}

export interface CierreResponse {
  id: string;
  ordenId: string;
  estado: string;
  documentos: CierreDocumentoResponse[];
  observaciones?: string;
  fechaCierre?: string;
  creadoPorId: string;
  createdAt: string;
}

// Repository Interface
export const CIERRE_REPOSITORY = Symbol("CIERRE_REPOSITORY");

export interface ICierreRepository {
  findByOrden(ordenId: string): Promise<any>;
  create(data: CreateCierreDto, userId: string): Promise<any>;
  uploadDocumento(
    cierreId: string,
    documentoId: string,
    url: string,
  ): Promise<void>;
  aprobar(cierreId: string, userId: string): Promise<any>;
  rechazar(cierreId: string, motivo: string): Promise<any>;
}
