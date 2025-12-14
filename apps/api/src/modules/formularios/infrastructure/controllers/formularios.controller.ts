/**
 * @controller FormulariosController
 */
import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListFormulariosUseCase,
  CreateFormularioUseCase,
  SubmitFormularioUseCase,
} from '../../application/use-cases';
import { CreateFormularioSchema, SubmitFormularioSchema } from '../../application/dto';

@Controller('formularios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormulariosController {
  constructor(
    private readonly listFormularios: ListFormulariosUseCase,
    private readonly createFormulario: CreateFormularioUseCase,
    private readonly submitFormulario: SubmitFormularioUseCase,
  ) {}

  @Get()
  async findAll(@Query('categoria') categoria?: string) {
    return this.listFormularios.execute(categoria);
  }

  @Post()
  @Roles('admin', 'supervisor')
  async create(@Body() body: unknown) {
    const result = CreateFormularioSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createFormulario.execute(result.data);
  }

  @Post('respuesta')
  @Roles('admin', 'supervisor', 'tecnico')
  async submit(@Body() body: unknown, @Req() req: any) {
    const result = SubmitFormularioSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.submitFormulario.execute(result.data, req.user.id);
  }
}
