import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFormInstanceDto, CreateFormTemplateDto, UpdateFormInstanceDto } from './forms.dto';
import { FormsService } from './forms.service';

@ApiTags('forms')
@ApiBearerAuth()
@Controller({ path: 'forms', version: '1' })
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // ===== TEMPLATES =====

  @Get('templates')
  @ApiOperation({ summary: 'List form templates' })
  async findAllTemplates(@Query('tipo') tipo?: string, @Query('activo') activo?: string) {
    return this.formsService.findAllTemplates({
      tipo,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
    });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  async findTemplateById(@Param('id') id: string) {
    return this.formsService.findTemplateById(id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create form template' })
  async createTemplate(@Body() dto: CreateFormTemplateDto) {
    const userId = 'system'; // TODO: Get from JWT
    return this.formsService.createTemplate(dto, userId);
  }

  // ===== INSTANCES =====

  @Get('instances')
  @ApiOperation({ summary: 'List form instances' })
  async findAllInstances(
    @Query('templateId') templateId?: string,
    @Query('ordenId') ordenId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.formsService.findAllInstances({ templateId, ordenId, estado });
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Get instance by ID' })
  async findInstanceById(@Param('id') id: string) {
    return this.formsService.findInstanceById(id);
  }

  @Post('instances')
  @ApiOperation({ summary: 'Create form instance' })
  async createInstance(@Body() dto: CreateFormInstanceDto) {
    const userId = 'system'; // TODO: Get from JWT
    return this.formsService.createInstance(dto, userId);
  }

  @Put('instances/:id')
  @ApiOperation({ summary: 'Update form instance' })
  async updateInstance(@Param('id') id: string, @Body() dto: UpdateFormInstanceDto) {
    return this.formsService.updateInstance(id, dto);
  }

  @Post('instances/:id/complete')
  @ApiOperation({ summary: 'Complete form instance' })
  async completeInstance(@Param('id') id: string) {
    const userId = 'system'; // TODO: Get from JWT
    return this.formsService.completeInstance(id, userId);
  }

  @Delete('instances/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete form instance' })
  async deleteInstance(@Param('id') id: string) {
    await this.formsService.deleteInstance(id);
  }
}
