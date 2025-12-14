/**
 * @repository IEvidenciaRepository
 * @description Interfaz del repositorio de evidencias
 */
import { EvidenciaEntity } from '../entities/evidencia.entity';

export const EVIDENCIA_REPOSITORY = Symbol('EVIDENCIA_REPOSITORY');

export interface EvidenciaFilters {
  ordenId?: string;
  ejecucionId?: string;
  tipo?: string;
}

export interface IEvidenciaRepository {
  /**
   * Busca evidencias con filtros
   */
  findAll(filters: EvidenciaFilters): Promise<EvidenciaEntity[]>;

  /**
   * Busca por ID
   */
  findById(id: string): Promise<EvidenciaEntity | null>;

  /**
   * Crea una nueva evidencia
   */
  create(evidencia: EvidenciaEntity): Promise<EvidenciaEntity>;

  /**
   * Elimina una evidencia
   */
  delete(id: string): Promise<void>;

  /**
   * Cuenta evidencias
   */
  count(filters: EvidenciaFilters): Promise<number>;
}
