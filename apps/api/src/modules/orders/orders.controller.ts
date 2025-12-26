import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    Request,
    Query,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from './dtos';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Órdenes de Trabajo')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear nueva orden de trabajo',
        description: 'Crea una nueva orden de trabajo con los datos proporcionados',
    })
    @ApiResponse({
        status: 201,
        description: 'Orden creada exitosamente',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos',
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado',
    })
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Request() req: any
    ) {
        try {
            return await this.ordersService.create(
                createOrderDto,
                req.user.userId
            );
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Listar órdenes de trabajo',
        description: 'Retorna lista paginada de órdenes',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Registros por página',
    })
    @ApiQuery({
        name: 'status',
        required: false,
        type: String,
        description: 'Filtrar por estado',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de órdenes',
        type: [OrderResponseDto],
    })
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('status') status?: string
    ) {
        return await this.ordersService.findAll({
            page: Number(page),
            limit: Number(limit),
            status,
        });
    }

    @Get('stats')
    @ApiOperation({
        summary: 'Obtener estadísticas de órdenes',
        description: 'Retorna conteo por estado',
    })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas de órdenes',
    })
    async getStats() {
        return await this.ordersService.getStats();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener una orden específica',
        description: 'Retorna los detalles de una orden por su ID',
    })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID de la orden',
    })
    @ApiResponse({
        status: 200,
        description: 'Detalles de la orden',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada',
    })
    async findOne(@Param('id') id: string) {
        return await this.ordersService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Actualizar una orden',
        description: 'Actualiza los datos de una orden existente',
    })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'UUID de la orden',
    })
    @ApiResponse({
        status: 200,
        description: 'Orden actualizada',
        type: OrderResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Orden no encontrada',
    })
    async updateOrder(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto
    ) {
        return await this.ordersService.update(id, updateOrderDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar una orden',
        description: 'Marca una orden como cancelada',
    })
    @ApiParam({
        name: 'id',
        type: String,
    })
    @ApiResponse({
        status: 204,
        description: 'Orden eliminada',
    })
    async deleteOrder(@Param('id') id: string) {
        await this.ordersService.delete(id);
    }
}
