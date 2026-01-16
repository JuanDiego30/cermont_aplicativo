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

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 409, description: 'NIT duplicado' })
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [CustomerResponseDto] })
  async findAll(@Query() query: CustomersQueryDto): Promise<CustomerResponseDto[]> {
    return this.customersService.findAll(query.activo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findById(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.findById(id);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Add customer contact' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async addContact(
    @Param('id') id: string,
    @Body() dto: CreateContactDto
  ): Promise<CustomerResponseDto> {
    return this.customersService.addContact(id, dto);
  }

  @Post(':id/locations')
  @ApiOperation({ summary: 'Add customer location' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async addLocation(
    @Param('id') id: string,
    @Body() dto: CreateLocationDto
  ): Promise<CustomerResponseDto> {
    return this.customersService.addLocation(id, dto);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get customer order history' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: CustomerOrdersResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async getCustomerOrders(@Param('id') id: string): Promise<CustomerOrdersResponseDto> {
    return this.customersService.getCustomerOrders(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate customer' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async deactivate(@Param('id') id: string): Promise<CustomerResponseDto> {
    return this.customersService.deactivate(id);
  }
}
