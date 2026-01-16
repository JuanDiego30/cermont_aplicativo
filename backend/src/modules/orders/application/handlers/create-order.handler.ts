import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrderRepository, Order_REPOSITORY } from '../../domain/repositories';
import { CreateOrderDto } from '../dto';
import { CreateOrderUseCase } from '../use-cases/create-order.use-case';

export class CreateOrderCommand {
  constructor(
    public readonly dto: CreateOrderDto,
    public readonly creadorId: string
  ) {}
}

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly createOrderUseCase: CreateOrderUseCase
  ) {}

  async execute(command: CreateOrderCommand) {
    return this.createOrderUseCase.execute(command.dto, command.creadorId);
  }
}
