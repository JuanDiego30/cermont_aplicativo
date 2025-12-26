/**
 * @useCase FindOrdenUseCase
 * @description Caso de uso para obtener una orden por ID
 * @layer Application
 */
import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { OrdenEntity } from '../../domain/entities/orden.entity';
import {
  IOrdenRepository,
  ORDEN_REPOSITORY,
} from '../../domain/repositories/orden.repository.interface';

@Injectable()
export class FindOrdenUseCase {
  private readonly logger = new Logger(FindOrdenUseCase.name);

  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly repository: IOrdenRepository,
  ) {}

  async execute(id: string): Promise<OrdenEntity> {
    try {
      this.logger.log(`Buscando orden: ${id}`);

      const orden = await this.repository.findById(id);
      if (!orden) {
        throw new NotFoundException(`Orden no encontrada: ${id}`);
      }

      return orden;
    } catch (error) {
      this.logger.error('Error buscando orden', error);
      throw error;
    }
  }
}

