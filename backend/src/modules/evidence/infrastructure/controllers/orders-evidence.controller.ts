import {
    BadRequestException,
    Controller,
    ForbiddenException,
    Get,
    Inject,
    NotFoundException,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { IOrderRepository, Order_REPOSITORY } from '../../../orders/domain/repositories';
import { ListEvidenciasUseCase } from '../../application/use-cases';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersEvidenceController {
  constructor(
    private readonly listEvidenciasUseCase: ListEvidenciasUseCase,
    @Inject(Order_REPOSITORY)
    private readonly ordenRepository: IOrderRepository,
  ) {}

  /**
   * Rule 29: Order gallery
   */
  @Get(':orderId/evidence')
  @ApiOperation({ summary: 'List evidence for an order (gallery)' })
  async listByOrder(
    @Param('orderId') orderId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    if (!orderId) {
      throw new BadRequestException('orderId is required');
    }

    const orden = await this.ordenRepository.findById(orderId);
    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    const role = user?.role?.toLowerCase();
    const isPrivileged = role === 'admin' || role === 'supervisor';
    const canAccess =
      isPrivileged || orden.creadorId === user?.userId || orden.asignadoId === user?.userId;
    if (!canAccess) {
      throw new ForbiddenException('No autorizado');
    }

    return this.listEvidenciasUseCase.execute({
      ordenId: orderId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }
}
