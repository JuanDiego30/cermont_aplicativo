import {
  Controller,
  Get,
  Post,
  Patch,
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
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ClientesService } from "./clientes.service";
import {
  CreateClienteDto,
  ClienteResponseDto,
  CreateContactoDto,
  CreateUbicacionDto,
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
  async create(@Body() dto: CreateClienteDto): Promise<ClienteResponseDto> {
    return this.clientesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los clientes" })
  @ApiQuery({ name: "activo", required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [ClienteResponseDto] })
  async findAll(
    @Query("activo") activo?: string,
  ): Promise<ClienteResponseDto[]> {
    const isActivo =
      activo === "true" ? true : activo === "false" ? false : undefined;
    return this.clientesService.findAll(isActivo);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener cliente por ID" })
  @ApiResponse({ status: 200, type: ClienteResponseDto })
  async findById(@Param("id") id: string): Promise<ClienteResponseDto> {
    return this.clientesService.findById(id);
  }

  @Post(":id/contactos")
  @ApiOperation({ summary: "Agregar contacto a cliente" })
  @ApiResponse({ status: 201, type: ClienteResponseDto })
  async addContacto(
    @Param("id") id: string,
    @Body() dto: CreateContactoDto,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.addContacto(id, dto);
  }

  @Post(":id/ubicaciones")
  @ApiOperation({ summary: "Agregar ubicación a cliente" })
  @ApiResponse({ status: 201, type: ClienteResponseDto })
  async addUbicacion(
    @Param("id") id: string,
    @Body() dto: CreateUbicacionDto,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.addUbicacion(id, dto);
  }

  @Get(":id/ordenes")
  @ApiOperation({ summary: "Obtener historial de órdenes del cliente" })
  async getOrdenesCliente(@Param("id") id: string) {
    return this.clientesService.getOrdenesCliente(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Desactivar cliente" })
  @ApiResponse({ status: 200, type: ClienteResponseDto })
  async desactivar(@Param("id") id: string): Promise<ClienteResponseDto> {
    return this.clientesService.desactivar(id);
  }
}
