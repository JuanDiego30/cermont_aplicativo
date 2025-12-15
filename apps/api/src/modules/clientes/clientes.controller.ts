/**
 * @controller ClientesController
 * @description Controlador REST para gestión de clientes
 * Los clientes se extraen dinámicamente del campo 'cliente' de las órdenes
 */

import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClienteResponseDto, ClienteStatsDto } from './dto/cliente.dto';

@ApiTags('Clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  /**
   * GET /clientes/stats
   * Obtener estadísticas de clientes
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de clientes',
    description: 'Devuelve el total de clientes y su distribución por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas correctamente',
    type: ClienteStatsDto,
  })
  async getStats(): Promise<ClienteStatsDto> {
    return this.clientesService.getStats();
  }

  /**
   * GET /clientes
   * Obtener todos los clientes
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los clientes',
    description: 'Lista todos los clientes únicos extraídos de las órdenes',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida correctamente',
    type: [ClienteResponseDto],
  })
  async findAll(): Promise<{ data: ClienteResponseDto[] }> {
    return this.clientesService.findAll();
  }

  /**
   * GET /clientes/:nombre
   * Obtener información de un cliente específico
   */
  @Get(':nombre')
  @ApiOperation({
    summary: 'Obtener información de un cliente',
    description: 'Devuelve información detallada de un cliente específico',
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del cliente',
    example: 'Ecopetrol',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: ClienteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async findByName(@Param('nombre') nombre: string): Promise<ClienteResponseDto> {
    return this.clientesService.findByName(nombre);
  }

  /**
   * GET /clientes/:nombre/ordenes
   * Obtener órdenes de un cliente específico
   */
  @Get(':nombre/ordenes')
  @ApiOperation({
    summary: 'Obtener órdenes de un cliente',
    description: 'Lista todas las órdenes asociadas a un cliente específico',
  })
  @ApiParam({
    name: 'nombre',
    description: 'Nombre del cliente',
    example: 'Ecopetrol',
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes del cliente obtenidas correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async getClienteOrdenes(@Param('nombre') nombre: string) {
    return this.clientesService.getClienteOrdenes(nombre);
  }
}
