import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Checklists')
@Controller('checklists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChecklistsController {
    constructor(private readonly checklistsService: ChecklistsService) { }
    @Get('ejecucion/:ejecucionId') findByEjecucion(@Param('ejecucionId') ejecucionId: string) { return this.checklistsService.findByEjecucion(ejecucionId); }
    @Put(':id/completar') completar(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.checklistsService.completar(id, user.userId); }
}
