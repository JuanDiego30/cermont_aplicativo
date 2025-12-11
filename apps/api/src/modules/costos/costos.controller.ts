import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CostosService } from './costos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Costos')
@Controller('costos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CostosController {
    constructor(private readonly costosService: CostosService) { }
    @Get('orden/:ordenId') findByOrden(@Param('ordenId') ordenId: string) { return this.costosService.findByOrden(ordenId); }
    @Post() create(@Body() dto: any) { return this.costosService.create(dto); }
    @Put(':id') update(@Param('id') id: string, @Body() dto: any) { return this.costosService.update(id, dto); }
    @Delete(':id') remove(@Param('id') id: string) { return this.costosService.remove(id); }
}
