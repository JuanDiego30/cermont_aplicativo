/**
 * Repository Interface: IFormTemplateRepository
 *
 * Contrato para persistencia de FormTemplate
 */

import { FormTemplate } from '../entities/form-template.entity';
import { FormTemplateId } from '../value-objects/form-template-id.vo';

export interface IFormTemplateRepository {
  /**
   * Guardar template (create o update)
   */
  save(template: FormTemplate): Promise<FormTemplate>;

  /**
   * Buscar por ID
   */
  findById(id: FormTemplateId): Promise<FormTemplate | null>;

  /**
   * Buscar por contexto
   */
  findByContext(contextType: string): Promise<FormTemplate[]>;

  /**
   * Buscar última versión por nombre
   */
  findLatestVersion(name: string): Promise<FormTemplate | null>;

  /**
   * Buscar todas las versiones por nombre
   */
  findAllVersions(name: string): Promise<FormTemplate[]>;

  /**
   * Verificar si existe template con nombre
   */
  exists(name: string): Promise<boolean>;

  /**
   * Buscar todos los templates activos
   */
  findAllActive(): Promise<FormTemplate[]>;

  /**
   * Buscar templates publicados
   */
  findPublished(): Promise<FormTemplate[]>;

  /**
   * Eliminar template (soft delete)
   */
  delete(id: FormTemplateId): Promise<void>;
}
