import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) { }

    @Get() @Roles('admin', 'supervisor')
    findAll(@Query('role') role?: string, @Query('active') active?: boolean) { return this.usuariosService.findAll({ role, active }); }

    @Get(':id') findOne(@Param('id') id: string) { return this.usuariosService.findOne(id); }

    @Post() @Roles('admin') create(@Body() dto: any) { return this.usuariosService.create(dto); }

    @Put(':id') @Roles('admin') update(@Param('id') id: string, @Body() dto: any) { return this.usuariosService.update(id, dto); }

    @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.usuariosService.remove(id); }
}
