import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdenesService } from './ordenes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Ordenes')
@Controller('ordenes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdenesController {
    constructor(private readonly ordenesService: OrdenesService) { }

    @Get() findAll(@Query('estado') estado?: string, @Query('cliente') cliente?: string, @Query('page') page?: number, @Query('limit') limit?: number) { return this.ordenesService.findAll({ estado, cliente, page, limit }); }
    @Get(':id') findOne(@Param('id') id: string) { return this.ordenesService.findOne(id); }
    @Post() create(@Body() dto: any, @CurrentUser() user: JwtPayload) { return this.ordenesService.create(dto, user.userId); }
    @Put(':id') update(@Param('id') id: string, @Body() dto: any) { return this.ordenesService.update(id, dto); }
    @Put(':id/estado') updateEstado(@Param('id') id: string, @Body('estado') estado: string) { return this.ordenesService.updateEstado(id, estado); }
    @Delete(':id') remove(@Param('id') id: string) { return this.ordenesService.remove(id); }
}
