/**
 * @repository IPlaneacionRepository
 * @description Interface del repositorio de planeación
 */
export const PLANEACION_REPOSITORY = Symbol("PLANEACION_REPOSITORY");

import { PlaneacionEstado } from "../enums";

export interface PlaneacionData {
  id: string;
  ordenId: string;
  estado: PlaneacionEstado;
  cronograma: Record<string, unknown>;
  manoDeObra: Record<string, unknown>;
  observaciones?: string;
  aprobadoPorId?: string;
  fechaAprobacion?: Date;
  kitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlaneacionRepository {
  findByOrdenId(ordenId: string): Promise<PlaneacionData | null>;
  createOrUpdate(
    ordenId: string,
    data: Partial<PlaneacionData>,
  ): Promise<PlaneacionData>;
  aprobar(id: string, aprobadorId: string): Promise<PlaneacionData>;
  rechazar(id: string, motivo: string): Promise<PlaneacionData>;
}
