/**
 * @interface IEvidenciaRepository
 * @description Repository interface for Evidencia persistence
 */

import { Evidencia } from "../entities";

export interface FindEvidenciasOptions {
  ordenId?: string;
  ejecucionId?: string;
  uploadedBy?: string;
  status?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface IEvidenciaRepository {
  /**
   * Save (create or update) an evidencia
   */
  save(evidencia: Evidencia): Promise<Evidencia>;

  /**
   * Find by ID
   */
  findById(id: string): Promise<Evidencia | null>;

  /**
   * Find by multiple IDs
   */
  findByIds(ids: string[]): Promise<Evidencia[]>;

  /**
   * Find evidencias by filter options
   */
  findMany(options: FindEvidenciasOptions): Promise<Evidencia[]>;

  /**
   * Count evidencias by filter
   */
  count(options: FindEvidenciasOptions): Promise<number>;

  /**
   * Check if file exists at path
   */
  existsByPath(path: string): Promise<boolean>;

  /**
   * Soft delete
   */
  softDelete(id: string, deletedBy: string): Promise<void>;

  /**
   * Restore from soft delete
   */
  restore(id: string): Promise<void>;

  /**
   * Permanent delete
   */
  permanentDelete(id: string): Promise<void>;

  /**
   * Find deleted evidencias (trash)
   */
  findDeleted(ordenId?: string): Promise<Evidencia[]>;
}

/**
 * Token for dependency injection
 */
export const EVIDENCIA_REPOSITORY = Symbol("IEvidenciaRepository");
