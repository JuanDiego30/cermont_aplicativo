import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ListUsuariosUseCase } from '../usuarios/application/use-cases';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';


@ApiTags('Tecnicos')
@Controller('tecnicos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TecnicosController {
    constructor(private readonly listUsuariosUseCase: ListUsuariosUseCase) { }

    @Get()
    @ApiOperation({ summary: 'Listar técnicos disponibles' })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('active') active?: boolean,
    ) {
        return this.listUsuariosUseCase.execute({
            page: Number(page),
            limit: Number(limit),
            role: 'tecnico',
            search,
            active,
        });
    }
}
