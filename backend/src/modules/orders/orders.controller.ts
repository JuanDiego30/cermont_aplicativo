import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangeStatusDto, CreateOrderDto, OrderFilterDto, UpdateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

/**
 * Simple OrdersController - REST endpoints
 * MVP Architecture: Direct service calls
 */
@ApiTags('orders')
@ApiBearerAuth()
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders' })
  async findAll(@Query() filters: OrderFilterDto) {
    return this.ordersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  async create(@Body() dto: CreateOrderDto) {
    // TODO: Get user from JWT token
    const creadorId = 'system';
    return this.ordersService.create(dto, creadorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order' })
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Change order status' })
  async changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    // TODO: Get user from JWT token
    const userId = 'system';
    return this.ordersService.changeStatus(id, dto.status, userId, dto.observaciones);
  }

  @Post(':id/assign/:tecnicoId')
  @ApiOperation({ summary: 'Assign technician to order' })
  async assignTechnician(@Param('id') id: string, @Param('tecnicoId') tecnicoId: string) {
    return this.ordersService.assignTechnician(id, tecnicoId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get order status history' })
  async getStatusHistory(@Param('id') id: string) {
    return this.ordersService.getStatusHistory(id);
  }
}
