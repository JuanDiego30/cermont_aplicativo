import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CierreAdministrativoService } from './cierre-administrativo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('CierreAdministrativo')
@Controller('cierre-administrativo')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CierreAdministrativoController {
    constructor(private readonly cierreService: CierreAdministrativoService) { }
    @Get('orden/:ordenId') findByOrden(@Param('ordenId') ordenId: string) { return this.cierreService.findByOrden(ordenId); }
    @Post('orden/:ordenId/acta') createActa(@Param('ordenId') ordenId: string, @Body() dto: any) { return this.cierreService.createActa(ordenId, dto); }
    @Post('orden/:ordenId/ses') createSes(@Param('ordenId') ordenId: string, @Body() dto: any) { return this.cierreService.createSes(ordenId, dto); }
    @Post('orden/:ordenId/factura') createFactura(@Param('ordenId') ordenId: string, @Body() dto: any) { return this.cierreService.createFactura(ordenId, dto); }
    @Put('orden/:ordenId/completar') completar(@Param('ordenId') ordenId: string, @CurrentUser() user: JwtPayload) { return this.cierreService.completar(ordenId, user.userId); }
}
