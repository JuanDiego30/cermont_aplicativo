import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateChecklistDto, UpdateChecklistItemDto } from './dto/create-checklist.dto';

@ApiTags('Checklists')
@Controller('checklists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChecklistsController {
    constructor(private readonly checklistsService: ChecklistsService) { }

    @Get('ejecucion/:ejecucionId')
    @ApiParam({ name: 'ejecucionId', type: 'string' })
    @ApiResponse({ status: 200, description: 'Checklists obtenidos' })
    findByEjecucion(@Param('ejecucionId') ejecucionId: string) {
        return this.checklistsService.findByEjecucion(ejecucionId);
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, description: 'Checklist obtenido con detalles' })
    findById(@Param('id') id: string) {
        return this.checklistsService.findChecklistById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({ status: 201, description: 'Checklist creado' })
    create(@Body() createDto: CreateChecklistDto, @CurrentUser() user: JwtPayload) {
            return this.checklistsService.create(
                createDto.ejecucionId,
                createDto.nombre,
                createDto.templateId,
            );
    }

    @Put('item/:itemId')
    @ApiParam({ name: 'itemId', type: 'string' })
    @ApiResponse({ status: 200, description: 'Item actualizado' })
    updateItem(@Param('itemId') itemId: string, @Body() updateDto: UpdateChecklistItemDto, @CurrentUser() user: JwtPayload) {
        return this.checklistsService.updateChecklistItem(itemId, updateDto, user.userId);
    }

    @Put(':id/completar')
    @ApiParam({ name: 'id', type: 'string' })
    @ApiResponse({ status: 200, description: 'Checklist completado' })
    completar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.checklistsService.completar(id, user.userId);
    }

    @Get('ejecucion/:ejecucionId/resumen')
    @ApiParam({ name: 'ejecucionId', type: 'string' })
    @ApiResponse({ status: 200, description: 'Resumen de conformidades' })
    getResumen(@Param('ejecucionId') ejecucionId: string) {
        return this.checklistsService.getResumenConformidades(ejecucionId);
    }

    @Get('templates/tipo/:tipo')
    @ApiParam({ name: 'tipo', type: 'string', description: 'LINEA_VIDA, CCTV, PLANEACION_OBRA' })
    @ApiResponse({ status: 200, description: 'Templates obtenidos' })
    getTemplatesByTipo(@Param('tipo') tipo: string) {
        return this.checklistsService.getTemplatesByTipo(tipo);
    }

    @Post('ejecucion/:ejecucionId/sync')
    @ApiParam({ name: 'ejecucionId', type: 'string' })
    @ApiResponse({ status: 200, description: 'Datos sincronizados' })
    syncOffline(@Param('ejecucionId') ejecucionId: string) {
        return this.checklistsService.syncOfflineData(ejecucionId);
    }
}
