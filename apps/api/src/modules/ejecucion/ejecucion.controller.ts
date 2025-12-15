import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EjecucionService } from './ejecucion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Ejecucion')
@Controller('ejecucion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EjecucionController {
    constructor(private readonly ejecucionService: EjecucionService) { }
    
    @Get('stats')
    getStats() {
        return this.ejecucionService.getStats();
    }
    
    @Get('orden/:ordenId')
    findByOrden(@Param('ordenId') ordenId: string) {
        return this.ejecucionService.findByOrden(ordenId);
    }
    
    @Post('orden/:ordenId/iniciar')
    iniciar(@Param('ordenId') ordenId: string, @Body() dto: any) {
        return this.ejecucionService.iniciar(ordenId, dto);
    }
    
    @Put(':id/avance')
    updateAvance(@Param('id') id: string, @Body() dto: any) {
        return this.ejecucionService.updateAvance(id, dto);
    }
    
    @Put(':id/completar')
    completar(@Param('id') id: string, @Body() dto: any) {
        return this.ejecucionService.completar(id, dto);
    }
}
