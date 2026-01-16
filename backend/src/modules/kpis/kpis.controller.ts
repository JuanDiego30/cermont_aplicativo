import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import {
    DashboardKpiDto,
    FinancialKpiDto,
    KpiFiltersDto,
    OrdenesKpiDto,
    TecnicosKpiDto,
} from './dto';
import { KpisService } from './kpis.service';

@ApiTags('kpis')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get all dashboard KPIs',
    description: 'Returns orders, technicians and financial KPIs in one call',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard KPIs retrieved successfully',
    type: DashboardKpiDto,
  })
  async getDashboard(@Query() filters: KpiFiltersDto): Promise<DashboardKpiDto> {
    return this.kpisService.getDashboardKpis(filters);
  }

  @Get('orders')
  @ApiOperation({
    summary: 'Get work orders KPIs',
    description: 'Order stats: total, completed, pending, completion rate',
  })
  @ApiResponse({
    status: 200,
    description: 'Order KPIs retrieved successfully',
    type: OrdenesKpiDto,
  })
  async getOrdenesKpis(@Query() filters: KpiFiltersDto): Promise<OrdenesKpiDto> {
    return this.kpisService.getOrdenesKpis(filters);
  }

  @Get('technicians')
  @ApiOperation({
    summary: 'Get technicians KPIs',
    description: 'Technicians stats: active, available, average efficiency',
  })
  @ApiResponse({
    status: 200,
    description: 'Technicians KPIs retrieved successfully',
    type: TecnicosKpiDto,
  })
  async getTecnicosKpis(@Query() filters: KpiFiltersDto): Promise<TecnicosKpiDto> {
    return this.kpisService.getTecnicosKpis(filters);
  }

  @Get('financial')
  @ApiOperation({
    summary: 'Get financial KPIs',
    description: 'Financial stats: revenue, costs, profit, margin',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial KPIs retrieved successfully',
    type: FinancialKpiDto,
  })
  async getFinancialKpis(@Query() filters: KpiFiltersDto): Promise<FinancialKpiDto> {
    return this.kpisService.getFinancialKpis(filters);
  }
}
