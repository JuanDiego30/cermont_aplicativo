import type { IKitRepository } from '../../../domain/repositories/IKitRepository';
import type { Kit } from '../../../domain/entities/Kit';
import { kitRepository } from '../../../infra/db/repositories/KitRepository';
import { logger } from '../../../shared/utils/logger';

/**
 * Caso de uso: Actualizar Kit
 * Permite actualizar un kit existente
 */
export class UpdateKit {
  constructor(private readonly repository: IKitRepository = kitRepository) {}

  async execute(
    kitId: string,
    updates: Partial<Omit<Kit, 'id' | 'createdAt' | 'updatedAt'>>,
    userId: string
  ): Promise<Kit | null> {
    try {
      // Verificar que el kit existe
      const existingKit = await this.repository.findById(kitId);

      if (!existingKit) {
        logger.warn('Intento de actualizar kit inexistente', { kitId, userId });
        return null;
      }

      // Actualizar el kit
      const updatedKit = await this.repository.update(kitId, updates);

      if (updatedKit) {
        logger.info('Kit actualizado por caso de uso', { kitId, userId });
      }

      return updatedKit;
    } catch (error) {
      logger.error('Error en caso de uso UpdateKit', { error, kitId, userId });
      throw error;
    }
  }
}
