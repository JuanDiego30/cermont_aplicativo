/**
 * @repository IEjecucionRepository
 */
export const EJECUCION_REPOSITORY = Symbol('EJECUCION_REPOSITORY');

export interface EjecucionData {
  id: string;
  ordenId: string;
  tecnicoId: string;
  estado: string;
  avance: number;
  horasReales: number;
  fechaInicio: Date;
  fechaFin?: Date;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEjecucionRepository {
  findByOrdenId(ordenId: string): Promise<EjecucionData | null>;
  iniciar(ordenId: string, tecnicoId: string, observaciones?: string): Promise<EjecucionData>;
  updateAvance(id: string, avance: number, observaciones?: string): Promise<EjecucionData>;
  completar(id: string, data: { observacionesFinales?: string; firmaDigital?: string }): Promise<EjecucionData>;
}
