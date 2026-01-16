/**
 * Repository Interface: IHESRepository
 *
 * Contrato para persistencia de HES
 */

import { HES } from '../entities/hes.entity';
import { HESId } from '../value-objects/hes-id.vo';
import { HESNumero } from '../value-objects/hes-numero.vo';

export interface IHESRepository {
  /**
   * Guardar HES (create o update)
   */
  save(hes: HES): Promise<HES>;

  /**
   * Buscar por ID
   */
  findById(id: HESId): Promise<HES | null>;

  /**
   * Buscar por número
   */
  findByNumero(numero: HESNumero): Promise<HES | null>;

  /**
   * Buscar por orden (relación 1:1)
   */
  findByOrden(ordenId: string): Promise<HES | null>;

  /**
   * Buscar último número por año
   */
  findLastNumberByYear(year: number): Promise<HESNumero | null>;

  /**
   * Verificar si existe número
   */
  existsByNumero(numero: string): Promise<boolean>;

  /**
   * Listar todas las HES con filtros
   */
  findAll(filters?: {
    estado?: string;
    tipoServicio?: string;
    ordenId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<HES[]>;

  /**
   * Eliminar HES (soft delete)
   */
  delete(id: HESId): Promise<void>;
}

export const HES_REPOSITORY = Symbol('HES_REPOSITORY');
