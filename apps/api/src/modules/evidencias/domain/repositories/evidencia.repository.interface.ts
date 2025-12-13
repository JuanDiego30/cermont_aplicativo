/**
 * @repository IEvidenciaRepository
 */
export const EVIDENCIA_REPOSITORY = Symbol('EVIDENCIA_REPOSITORY');

export interface EvidenciaData {
  id: string;
  ordenId: string;
  tipo: string;
  url: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
  creadoPorId: string;
  createdAt: Date;
}

export interface CreateEvidenciaData {
  ordenId: string;
  tipo: string;
  url: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
  creadoPorId: string;
}

export interface IEvidenciaRepository {
  findByOrdenId(ordenId: string): Promise<EvidenciaData[]>;
  findById(id: string): Promise<EvidenciaData | null>;
  create(data: CreateEvidenciaData): Promise<EvidenciaData>;
  delete(id: string): Promise<void>;
  count(ordenId: string): Promise<number>;
}
