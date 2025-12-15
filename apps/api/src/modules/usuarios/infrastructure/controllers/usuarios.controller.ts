/**
 * ARCHIVO: usuarios.controller.ts
 * FUNCION: Controlador REST para endpoints de usuarios con autorización RBAC
 * IMPLEMENTACION: Valida DTOs con Zod, delega a use cases, protege con JWT y roles
 * DEPENDENCIAS: NestJS, Swagger, Guards JWT/Roles, Use Cases, DTOs Zod
 * EXPORTS: UsuariosControllerRefactored
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
  ListUsuariosUseCase,
  GetUsuarioByIdUseCase,
  CreateUsuarioUseCase,
  UpdateUsuarioUseCase,
  DeactivateUsuarioUseCase,
} from '../../application/use-cases';
import {
  CreateUsuarioSchema,
  UpdateUsuarioSchema,
  UsuarioQuerySchema,
} from '../../application/dto';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuariosControllerRefactored {
  constructor(
    private readonly listUsuariosUseCase: ListUsuariosUseCase,
    private readonly getUsuarioByIdUseCase: GetUsuarioByIdUseCase,
    private readonly createUsuarioUseCase: CreateUsuarioUseCase,
    private readonly updateUsuarioUseCase: UpdateUsuarioUseCase,
    private readonly deactivateUsuarioUseCase: DeactivateUsuarioUseCase,
  ) {}

  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Listar usuarios' })
  async findAll(@Query() query: unknown) {
    const result = UsuarioQuerySchema.safeParse(query);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.listUsuariosUseCase.execute(result.data);
  }

  @Get(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id') id: string) {
    return this.getUsuarioByIdUseCase.execute(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario' })
  async create(@Body() body: unknown) {
    const result = CreateUsuarioSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createUsuarioUseCase.execute(result.data);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const result = UpdateUsuarioSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.updateUsuarioUseCase.execute(id, result.data);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Desactivar usuario' })
  async remove(@Param('id') id: string) {
    return this.deactivateUsuarioUseCase.execute(id);
  }
}
