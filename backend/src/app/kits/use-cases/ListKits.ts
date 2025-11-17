import type { IKitRepository } from '../../../domain/repositories/IKitRepository.js';
import type { Kit } from '../../../domain/entities/Kit.js';
import { kitRepository } from '../../../infra/db/repositories/KitRepository.js';
import { logger } from '../../../shared/utils/logger.js';

/**
 * Caso de uso: Listar Kits
 * Permite obtener una lista de kits con filtros y paginaci�n
 */
export class ListKits {
  constructor(private readonly repository: IKitRepository = kitRepository) {}

  async execute(
    filters: {
      category?: string;
      active?: boolean;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{
    kits: Kit[];
    total: number;
  }> {
    try {
      const result = await this.repository.findAll(filters);

      logger.info('Kits listados por caso de uso', {
        total: result.total,
        filters,
      });

      return result;
    } catch (error) {
      logger.error('Error en caso de uso ListKits', { error, filters });
      throw error;
    }
  }
}
