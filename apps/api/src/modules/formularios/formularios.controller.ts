import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FormulariosService } from './formularios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Formularios')
@Controller('formularios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FormulariosController {
    constructor(private readonly formulariosService: FormulariosService) { }
    @Get('templates') findTemplates() { return this.formulariosService.findTemplates(); }
    @Get('template/:id') findTemplate(@Param('id') id: string) { return this.formulariosService.findTemplate(id); }
    @Post('template') createTemplate(@Body() dto: any, @CurrentUser() user: JwtPayload) { return this.formulariosService.createTemplate(dto, user.userId); }
    @Post('respuesta') submitResponse(@Body() dto: any, @CurrentUser() user: JwtPayload) { return this.formulariosService.submitResponse(dto, user.userId); }
}
