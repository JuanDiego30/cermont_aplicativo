/**
 * @controller HESController
 *
 * API REST para gestión de HES (Hoja de Entrada de Servicio)
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../../../common/decorators/current-user.decorator';

// Use Cases
import {
  CreateHESUseCase,
  GetHESUseCase,
  ListHESUseCase,
  SignHESClienteUseCase,
  SignHESTecnicoUseCase,
  CompleteHESUseCase,
  GetHESByOrdenUseCase,
  ExportHESPDFUseCase,
} from '../../application/use-cases';

// DTOs
import {
  CreateHESDto,
  SignHESDto,
  HESResponseDto,
  ListHESQueryDto,
} from '../../application/dto';

// Mappers
import { HESMapper } from '../../application/mappers/hes.mapper';

@ApiTags('HES - Hoja de Entrada de Servicio')
@Controller('hes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HESController {
  constructor(
    private readonly createHESUseCase: CreateHESUseCase,
    private readonly getHESUseCase: GetHESUseCase,
    private readonly listHESUseCase: ListHESUseCase,
    private readonly signHESClienteUseCase: SignHESClienteUseCase,
    private readonly signHESTecnicoUseCase: SignHESTecnicoUseCase,
    private readonly completeHESUseCase: CompleteHESUseCase,
    private readonly getHESByOrdenUseCase: GetHESByOrdenUseCase,
    private readonly exportHESPDFUseCase: ExportHESPDFUseCase,
  ) {}

  @Post()
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Crear nueva HES' })
  @ApiResponse({ status: 201, description: 'HES creada exitosamente', type: HESResponseDto })
  async create(
    @Body() dto: CreateHESDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<HESResponseDto> {
    const hes = await this.createHESUseCase.execute(dto, user.userId);
    return HESMapper.toResponseDto(hes);
  }

  @Get()
  @ApiOperation({ summary: 'Listar HES con filtros' })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'tipoServicio', required: false })
  @ApiQuery({ name: 'ordenId', required: false })
  @ApiQuery({ name: 'fechaDesde', required: false })
  @ApiQuery({ name: 'fechaHasta', required: false })
  async findAll(@Query() query: ListHESQueryDto): Promise<HESResponseDto[]> {
    const hesList = await this.listHESUseCase.execute(query);
    return hesList.map((hes) => HESMapper.toResponseDto(hes));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener HES por ID' })
  async findOne(@Param('id') id: string): Promise<HESResponseDto> {
    const hes = await this.getHESUseCase.execute(id);
    return HESMapper.toResponseDto(hes);
  }

  @Get('orden/:ordenId')
  @ApiOperation({ summary: 'Obtener HES por orden (relación 1:1)' })
  async findByOrden(@Param('ordenId') ordenId: string): Promise<HESResponseDto> {
    const hes = await this.getHESByOrdenUseCase.execute(ordenId);
    return HESMapper.toResponseDto(hes);
  }

  @Post(':id/firmar-cliente')
  @Roles('admin', 'supervisor', 'tecnico', 'cliente')
  @ApiOperation({ summary: 'Firmar HES por parte del cliente' })
  async signCliente(
    @Param('id') id: string,
    @Body() dto: SignHESDto,
    @Req() req: any,
  ): Promise<HESResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const hes = await this.signHESClienteUseCase.execute(id, dto, ipAddress, userAgent);
    return HESMapper.toResponseDto(hes);
  }

  @Post(':id/firmar-tecnico')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Firmar HES por parte del técnico' })
  async signTecnico(
    @Param('id') id: string,
    @Body() dto: SignHESDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: any,
  ): Promise<HESResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const hes = await this.signHESTecnicoUseCase.execute(id, dto, user.userId, ipAddress, userAgent);
    return HESMapper.toResponseDto(hes);
  }

  @Put(':id/completar')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Completar HES (valida completitud y firmas)' })
  async complete(@Param('id') id: string): Promise<HESResponseDto> {
    const hes = await this.completeHESUseCase.execute(id);
    return HESMapper.toResponseDto(hes);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Exportar HES a PDF' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente', content: { 'application/pdf': {} } })
  async exportPDF(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const pdfBuffer = await this.exportHESPDFUseCase.execute(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="HES-${id}.pdf"`);
    res.send(pdfBuffer);
  }
}
