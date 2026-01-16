/**
 * @useCase FindOrderUseCase
 * @description Caso de uso para obtener una Order por ID
 * @layer Application
 */
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../../domain/entities/order.entity';
import {
  IOrderRepository,
  Order_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';

@Injectable()
export class FindOrderUseCase {
  private readonly logger = new Logger(FindOrderUseCase.name);

  constructor(
    @Inject(Order_REPOSITORY)
    private readonly repository: IOrderRepository
  ) {}

  async execute(id: string): Promise<OrderEntity> {
    try {
      this.logger.log(`Buscando Order: ${id}`);

      const Order = await this.repository.findById(id);
      if (!Order) {
        throw new NotFoundException(`Order no encontrada: ${id}`);
      }

      return Order;
    } catch (error) {
      this.logger.error('Error buscando Order', error);
      throw error;
    }
  }
}
