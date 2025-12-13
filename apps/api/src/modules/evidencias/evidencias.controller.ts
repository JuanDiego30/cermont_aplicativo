import { Express } from 'express';
import { Controller, Get, Post, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { EvidenciasService } from './evidencias.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Evidencias')
@Controller('evidencias')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvidenciasController {
    constructor(private readonly evidenciasService: EvidenciasService) { }
    @Get('orden/:ordenId') findByOrden(@Param('ordenId') ordenId: string) { return this.evidenciasService.findByOrden(ordenId); }
    @Get('ejecucion/:ejecucionId') findByEjecucion(@Param('ejecucionId') ejecucionId: string) { return this.evidenciasService.findByEjecucion(ejecucionId); }
    @Post('upload') @ApiConsumes('multipart/form-data') @UseInterceptors(FileInterceptor('file'))
    upload(@UploadedFile() file: Express.Multer.File, @Body() dto: any, @CurrentUser() user: JwtPayload) { return this.evidenciasService.upload(file, dto, user.userId); }
    @Delete(':id') remove(@Param('id') id: string) { return this.evidenciasService.remove(id); }
}

