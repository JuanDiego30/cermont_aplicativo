import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MantenimientosService } from './mantenimientos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Mantenimientos')
@Controller('mantenimientos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MantenimientosController {
    constructor(private readonly mantenimientosService: MantenimientosService) { }
    
    @Get('stats')
    getStats() {
        return this.mantenimientosService.getStats();
    }
    
    @Get()
    findAll(@Query('estado') estado?: string) {
        return this.mantenimientosService.findAll(estado);
    }
    
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mantenimientosService.findOne(id);
    }
    
    @Post()
    create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
        return this.mantenimientosService.create(dto, user.userId);
    }
    
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.mantenimientosService.update(id, dto);
    }
}
