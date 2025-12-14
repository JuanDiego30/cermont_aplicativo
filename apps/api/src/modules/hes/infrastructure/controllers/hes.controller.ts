/**
 * @controller HESController
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
import { ListHESUseCase, CreateHESUseCase } from '../../application/use-cases';
import { HESQuerySchema, CreateHESSchema } from '../../application/dto';

@Controller('hes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HESController {
  constructor(
    private readonly listHES: ListHESUseCase,
    private readonly createHES: CreateHESUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: unknown) {
    const result = HESQuerySchema.safeParse(query);
    const filters = result.success ? result.data : {};
    return this.listHES.execute(filters);
  }

  @Post()
  @Roles('admin', 'supervisor', 'tecnico')
  async create(@Body() body: unknown, @Req() req: any) {
    const result = CreateHESSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createHES.execute(result.data, req.user.id);
  }
}
