/**
 * @controller TechniciansController
 * @description REST API for Technicians following Clean Architecture
 * @layer Infrastructure
 */
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

import { TechniciansService } from './technicians.service';

@ApiTags('Technicians')
@Controller('technicians')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'List all technicians' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  async findAll(@Query('search') search?: string, @Query('active') active?: boolean) {
    return this.techniciansService.findAll({ search, active });
  }

  @Get('available')
  @ApiOperation({ summary: 'List available technicians for assignment' })
  async findAvailable() {
    const data = await this.techniciansService.findAvailable();
    return { data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get technician details' })
  async findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Change technician availability' })
  async changeAvailability(
    @Param('id') id: string,
    @Body() body: { availability: string } // Simplify enum for now
  ) {
    return this.techniciansService.changeAvailability(id, body.availability);
  }
}
