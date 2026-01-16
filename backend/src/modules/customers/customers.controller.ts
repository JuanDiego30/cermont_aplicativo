import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import {
  CreateContactDto,
  CreateCustomerDto,
  CreateLocationDto,
  CustomerOrdersResponseDto,
  CustomerResponseDto,
  CustomersQueryDto,
} from './application/dto/customers.dto';
import { CustomersService } from './customers.service';

@ApiTags('Clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 409, description: 'NIT duplicado' })
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [CustomerResponseDto] })
  async findAll(@Query() query: CustomersQueryDto): Promise<CustomerResponseDto[]> {
    return this.customersService.findAll(query.activo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findById(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.findById(id);
  }

  @Post(':id/contactos')
  @ApiOperation({ summary: 'Agregar contacto a cliente' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async addContact(
    @Param('id') id: string,
    @Body() dto: CreateContactDto
  ): Promise<CustomerResponseDto> {
    return this.customersService.addContact(id, dto);
  }

  @Post(':id/ubicaciones')
  @ApiOperation({ summary: 'Agregar ubicación a cliente' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async addLocation(
    @Param('id') id: string,
    @Body() dto: CreateLocationDto
  ): Promise<CustomerResponseDto> {
    return this.customersService.addLocation(id, dto);
  }

  @Get(':id/ordenes')
  @ApiOperation({ summary: 'Obtener historial de órdenes del cliente' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: CustomerOrdersResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async getCustomerOrders(@Param('id') id: string): Promise<CustomerOrdersResponseDto> {
    return this.customersService.getCustomerOrders(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar cliente' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async deactivate(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.deactivate(id);
  }
}
