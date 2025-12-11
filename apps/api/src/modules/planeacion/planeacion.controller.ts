import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlaneacionService } from './planeacion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Planeacion')
@Controller('planeacion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaneacionController {
    constructor(private readonly planeacionService: PlaneacionService) { }
    @Get('orden/:ordenId') findByOrden(@Param('ordenId') ordenId: string) { return this.planeacionService.findByOrden(ordenId); }
    @Post('orden/:ordenId') createOrUpdate(@Param('ordenId') ordenId: string, @Body() dto: any) { return this.planeacionService.createOrUpdate(ordenId, dto); }
    @Put(':id/aprobar') aprobar(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.planeacionService.aprobar(id, user.userId); }
    @Put(':id/rechazar') rechazar(@Param('id') id: string, @Body('motivo') motivo: string) { return this.planeacionService.rechazar(id, motivo); }
}
