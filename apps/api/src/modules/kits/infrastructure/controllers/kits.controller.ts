/**
 * @controller KitsController
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ListKitsUseCase, CreateKitUseCase } from '../../application/use-cases';
import { CreateKitSchema } from '../../application/dto';

@Controller('kits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KitsController {
  constructor(
    private readonly listKits: ListKitsUseCase,
    private readonly createKit: CreateKitUseCase,
  ) {}

  @Get()
  async findAll(@Query('categoria') categoria?: string) {
    return this.listKits.execute(categoria);
  }

  @Post()
  @Roles('admin', 'supervisor')
  async create(@Body() body: unknown) {
    const result = CreateKitSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.createKit.execute(result.data);
  }
}
