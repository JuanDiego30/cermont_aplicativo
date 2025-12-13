/**
 * @controller UsuariosController (Refactorizado)
 * @description Controlador de usuarios con Clean Architecture
 * @layer Infrastructure
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
    const parsedQuery = UsuarioQuerySchema.parse(query);
    return this.listUsuariosUseCase.execute(parsedQuery);
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
    const dto = CreateUsuarioSchema.parse(body);
    return this.createUsuarioUseCase.execute(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const dto = UpdateUsuarioSchema.parse(body);
    return this.updateUsuarioUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Desactivar usuario' })
  async remove(@Param('id') id: string) {
    return this.deactivateUsuarioUseCase.execute(id);
  }
}
