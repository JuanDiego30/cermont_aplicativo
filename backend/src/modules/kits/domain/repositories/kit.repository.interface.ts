/**
 * Repository Interface: IKitRepository
 *
 * Contrato para persistencia de Kit Aggregate
 */
import { Kit } from '../entities/kit.entity';
import { KitId } from '../value-objects/kit-id.vo';
import { CategoriaKit } from '../value-objects/categoria-kit.vo';
import { EstadoKit } from '../value-objects/estado-kit.vo';

export const KIT_REPOSITORY = Symbol('KIT_REPOSITORY');

export interface IKitRepository {
  /**
   * Save kit (create or update)
   */
  save(kit: Kit): Promise<Kit>;

  /**
   * Find by ID
   */
  findById(id: KitId): Promise<Kit | null>;

  /**
   * Find by codigo
   */
  findByCodigo(codigo: string): Promise<Kit | null>;

  /**
   * Find by categoria
   */
  findByCategoria(categoria: CategoriaKit): Promise<Kit[]>;

  /**
   * Find all active kits
   */
  findAllActive(): Promise<Kit[]>;

  /**
   * Find by estado
   */
  findByEstado(estado: EstadoKit): Promise<Kit[]>;

  /**
   * Find templates (plantillas)
   */
  findTemplates(): Promise<Kit[]>;

  /**
   * Check if codigo exists
   */
  existsByCodigo(codigo: string): Promise<boolean>;

  /**
   * Get next sequence for codigo generation
   */
  getNextSequence(categoriaPrefix: string): Promise<number>;

  /**
   * Delete kit (soft delete)
   */
  delete(id: KitId): Promise<void>;

  /**
   * Count kits by categoria
   */
  countByCategoria(categoria: CategoriaKit): Promise<number>;
}
