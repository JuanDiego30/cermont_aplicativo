import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HesService } from './hes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('HES')
@Controller('hes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HesController {
    constructor(private readonly hesService: HesService) { }
    @Get('equipos') findAllEquipos() { return this.hesService.findAllEquipos(); }
    @Get('equipo/:id') findEquipo(@Param('id') id: string) { return this.hesService.findEquipo(id); }
    @Post('inspeccion') createInspeccion(@Body() dto: any, @CurrentUser() user: JwtPayload) { return this.hesService.createInspeccion(dto, user.userId); }
    @Get('inspecciones/equipo/:equipoId') findInspeccionesByEquipo(@Param('equipoId') equipoId: string) { return this.hesService.findInspeccionesByEquipo(equipoId); }
}
