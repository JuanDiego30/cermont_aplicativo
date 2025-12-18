import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EjecucionService } from './ejecucion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import {
    IniciarEjecucionSchema,
    UpdateAvanceSchema,
    CompletarEjecucionSchema,
} from './application/dto';

@ApiTags('Ejecucion')
@Controller('ejecucion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EjecucionController {
    constructor(private readonly ejecucionService: EjecucionService) { }

    @Get('mis-ejecuciones')
    @ApiOperation({ summary: 'Obtener ejecuciones del técnico actual' })
    findMine(@CurrentUser() user: JwtPayload) {
        return this.ejecucionService.findForUser(user.userId);
    }

    @Get('orden/:ordenId')
    @ApiOperation({ summary: 'Obtener ejecución por orden' })
    findByOrden(@Param('ordenId') ordenId: string) {
        return this.ejecucionService.findByOrden(ordenId);
    }

    @Post('orden/:ordenId/iniciar')
    @ApiOperation({ summary: 'Iniciar ejecución de orden' })
    iniciar(@Param('ordenId') ordenId: string, @Body() body: unknown) {
        const dto = IniciarEjecucionSchema.parse(body);
        return this.ejecucionService.iniciar(ordenId, dto);
    }

    @Put(':id/avance')
    @ApiOperation({ summary: 'Actualizar avance de ejecución' })
    updateAvance(@Param('id') id: string, @Body() body: unknown) {
        const dto = UpdateAvanceSchema.parse(body);
        return this.ejecucionService.updateAvance(id, dto);
    }

    @Put(':id/completar')
    @ApiOperation({ summary: 'Completar ejecución' })
    completar(@Param('id') id: string, @Body() body: unknown) {
        const dto = CompletarEjecucionSchema.parse(body);
        return this.ejecucionService.completar(id, dto);
    }
}
