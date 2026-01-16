import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrderRepository, Order_REPOSITORY } from '../../domain/repositories';
import { UpdateOrderDto } from '../dto';
import { UpdateOrderUseCase } from '../use-cases/update-order.use-case';

export class UpdateOrderCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateOrderDto
  ) {}
}

@Injectable()
@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler implements ICommandHandler<UpdateOrderCommand> {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly updateOrderUseCase: UpdateOrderUseCase
  ) {}

  async execute(command: UpdateOrderCommand) {
    const exists = await this.orderRepository.findById(command.id);

    if (!exists) {
      throw new NotFoundException(`Order con ID ${command.id} no encontrada`);
    }

    return this.updateOrderUseCase.execute(command.id, command.dto);
  }
}
