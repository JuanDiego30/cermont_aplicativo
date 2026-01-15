import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ClientesService } from "./clientes.service";
import {
  CreateClienteDto,
  ClienteResponseDto,
  CreateContactoDto,
  CreateUbicacionDto,
  ClientesQueryDto,
  ClienteOrdenesResponseDto,
} from "./application/dto/clientes.dto";

@ApiTags("Clientes")
@Controller("clientes")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: "Crear nuevo cliente" })
  @ApiResponse({ status: 201, type: ClienteResponseDto })
  @ApiResponse({ status: 409, description: "NIT duplicado" })
  async create(@Body() dto: CreateClienteDto): Promise<ClienteResponseDto> {
    return this.clientesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los clientes" })
  @ApiQuery({ name: "activo", required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [ClienteResponseDto] })
  async findAll(@Query() query: ClientesQueryDto): Promise<ClienteResponseDto[]> {
    return this.clientesService.findAll(query.activo);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener cliente por ID" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, type: ClienteResponseDto })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  async findById(@Param("id") id: string): Promise<ClienteResponseDto> {
    return this.clientesService.findById(id);
  }

  @Post(":id/contactos")
  @ApiOperation({ summary: "Agregar contacto a cliente" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 201, type: ClienteResponseDto })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  async addContacto(
    @Param("id") id: string,
    @Body() dto: CreateContactoDto,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.addContacto(id, dto);
  }

  @Post(":id/ubicaciones")
  @ApiOperation({ summary: "Agregar ubicación a cliente" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 201, type: ClienteResponseDto })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  async addUbicacion(
    @Param("id") id: string,
    @Body() dto: CreateUbicacionDto,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.addUbicacion(id, dto);
  }

  @Get(":id/ordenes")
  @ApiOperation({ summary: "Obtener historial de órdenes del cliente" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, type: ClienteOrdenesResponseDto })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  async getOrdenesCliente(
    @Param("id") id: string,
  ): Promise<ClienteOrdenesResponseDto> {
    return this.clientesService.getOrdenesCliente(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Desactivar cliente" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, type: ClienteResponseDto })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  async desactivar(@Param("id") id: string): Promise<ClienteResponseDto> {
    return this.clientesService.desactivar(id);
  }
}
