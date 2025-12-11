import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KitsService } from './kits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Kits')
@Controller('kits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KitsController {
    constructor(private readonly kitsService: KitsService) { }
    @Get() findAll() { return this.kitsService.findAll(); }
    @Get(':id') findOne(@Param('id') id: string) { return this.kitsService.findOne(id); }
    @Post() @Roles('admin', 'supervisor') create(@Body() dto: any) { return this.kitsService.create(dto); }
    @Put(':id') @Roles('admin', 'supervisor') update(@Param('id') id: string, @Body() dto: any) { return this.kitsService.update(id, dto); }
    @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.kitsService.remove(id); }
}
