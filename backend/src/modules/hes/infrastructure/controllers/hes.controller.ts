/**
 * @controller HESController
 *
 * API REST para gestión de HES (Hoja de Entrada de Servicio)
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';

// Use Cases
import {
  CompleteHESUseCase,
  CreateHESUseCase,
  ExportHESPDFUseCase,
  GetHESByOrdenUseCase,
  GetHESUseCase,
  ListHESUseCase,
  SignHESClienteUseCase,
  SignHESTecnicoUseCase,
} from '../../application/use-cases';

// DTOs
import { CreateHESDto, HESResponseDto, ListHESQueryDto, SignHESDto } from '../../application/dto';

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
    private readonly exportHESPDFUseCase: ExportHESPDFUseCase
  ) {}

  @Post()
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Crear nueva HES' })
  @ApiResponse({
    status: 201,
    description: 'HES creada exitosamente',
    type: HESResponseDto,
  })
  async create(
    @Body() dto: CreateHESDto,
    @CurrentUser() user: JwtPayload
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
    return hesList.map(hes => HESMapper.toResponseDto(hes));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener HES por ID' })
  async findOne(@Param('id') id: string): Promise<HESResponseDto> {
    const hes = await this.getHESUseCase.execute(id);
    return HESMapper.toResponseDto(hes);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get HES by order (1:1 relationship)' })
  async findByOrden(@Param('orderId') orderId: string): Promise<HESResponseDto> {
    const hes = await this.getHESByOrdenUseCase.execute(orderId);
    return HESMapper.toResponseDto(hes);
  }

  @Post(':id/sign-customer')
  @Roles('admin', 'supervisor', 'tecnico', 'cliente')
  @ApiOperation({ summary: 'Customer signs HES' })
  async signCliente(
    @Param('id') id: string,
    @Body() dto: SignHESDto,
    @Req() req: any
  ): Promise<HESResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const hes = await this.signHESClienteUseCase.execute(id, dto, ipAddress, userAgent);
    return HESMapper.toResponseDto(hes);
  }

  @Post(':id/sign-technician')
  @Roles('admin', 'supervisor', 'tecnico')
  @ApiOperation({ summary: 'Technician signs HES' })
  async signTecnico(
    @Param('id') id: string,
    @Body() dto: SignHESDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: any
  ): Promise<HESResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const hes = await this.signHESTecnicoUseCase.execute(
      id,
      dto,
      user.userId,
      ipAddress,
      userAgent
    );
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
  @ApiResponse({
    status: 200,
    description: 'PDF generado exitosamente',
    content: { 'application/pdf': {} },
  })
  async exportPDF(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const pdfBuffer = await this.exportHESPDFUseCase.execute(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="HES-${id}.pdf"`);
    res.send(pdfBuffer);
  }
}
