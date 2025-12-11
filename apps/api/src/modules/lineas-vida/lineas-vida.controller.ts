import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LineasVidaService } from './lineas-vida.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('LineasVida')
@Controller('lineas-vida')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LineasVidaController {
    constructor(private readonly lineasVidaService: LineasVidaService) { }
    @Get() findAll() { return this.lineasVidaService.findAll(); }
    @Get(':id') findOne(@Param('id') id: string) { return this.lineasVidaService.findOne(id); }
    @Post() create(@Body() dto: any, @CurrentUser() user: JwtPayload) { return this.lineasVidaService.create(dto, user.userId); }
}
