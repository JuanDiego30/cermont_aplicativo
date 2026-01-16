/**
 * @controller FormulariosController
 *
 * API REST para gestión de formularios dinámicos con DDD.
 * - CRUD de Templates
 * - CRUD de Submissions
 * - Parsing de PDF/Excel
 * - PDF generation from filled forms
 */
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

// Use Cases
import {
  ArchiveTemplateUseCase,
  CreateTemplateUseCase,
  GetSubmissionUseCase,
  GetTemplateUseCase,
  ListSubmissionsUseCase,
  ListTemplatesUseCase,
  PublishTemplateUseCase,
  SubmitFormUseCase,
  UpdateTemplateUseCase,
} from '../../application/use-cases';

// DTOs
import {
  CreateFormTemplateDto,
  FormTemplateResponseDto,
  ListSubmissionsQueryDto,
  ListTemplatesQueryDto,
  SubmitFormDto,
  UpdateFormTemplateDto,
} from '../../application/dto';

// Mappers
import { FormTemplateMapper } from '../../application/mappers/form-template.mapper';
import { FormsService } from '../../forms.service';

// PDF Generation
import { FormInspectionPdfService } from '../../../pdf-generation/application/services/form-inspection-pdf.service';

// Legacy (deprecar)

@ApiTags('Forms - Dynamic Form Engine')
@Controller('forms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FormsController {
  constructor(
    // Use Cases
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
    private readonly publishTemplateUseCase: PublishTemplateUseCase,
    private readonly archiveTemplateUseCase: ArchiveTemplateUseCase,
    private readonly getTemplateUseCase: GetTemplateUseCase,
    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    private readonly submitFormUseCase: SubmitFormUseCase,
    private readonly getSubmissionUseCase: GetSubmissionUseCase,
    private readonly listSubmissionsUseCase: ListSubmissionsUseCase,

    // PDF Generation
    private readonly formInspectionPdfService: FormInspectionPdfService,

    // Legacy (deprecar)
    private readonly formsService: FormsService
  ) {}

  // ========================================
  // TEMPLATES
  // ========================================

  @Post('templates')
  @ApiOperation({ summary: 'Crear nuevo template de formulario' })
  @ApiResponse({ status: 201, description: 'Template creado exitosamente' })
  async createTemplate(
    @Body() dto: CreateFormTemplateDto,
    @CurrentUser() user: JwtPayload
  ): Promise<FormTemplateResponseDto> {
    const template = await this.createTemplateUseCase.execute(dto, user.userId);
    return FormTemplateMapper.toResponseDto(template);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar todos los templates' })
  async findAllTemplates(
    @Query() query: ListTemplatesQueryDto
  ): Promise<FormTemplateResponseDto[]> {
    const templates = await this.listTemplatesUseCase.execute(query);
    return templates.map(t => FormTemplateMapper.toResponseDto(t));
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Obtener template por ID' })
  async findTemplateById(@Param('id') id: string): Promise<FormTemplateResponseDto> {
    const template = await this.getTemplateUseCase.execute(id);
    return FormTemplateMapper.toResponseDto(template);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Actualizar template' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateFormTemplateDto,
    @CurrentUser() user: JwtPayload
  ): Promise<FormTemplateResponseDto> {
    const template = await this.updateTemplateUseCase.execute(id, dto, user.userId);
    return FormTemplateMapper.toResponseDto(template);
  }

  @Post('templates/:id/publish')
  @ApiOperation({ summary: 'Publicar template' })
  async publishTemplate(@Param('id') id: string): Promise<FormTemplateResponseDto> {
    const template = await this.publishTemplateUseCase.execute(id);
    return FormTemplateMapper.toResponseDto(template);
  }

  @Post('templates/:id/archive')
  @ApiOperation({ summary: 'Archivar template' })
  async archiveTemplate(@Param('id') id: string): Promise<FormTemplateResponseDto> {
    const template = await this.archiveTemplateUseCase.execute(id);
    return FormTemplateMapper.toResponseDto(template);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Desactivar template (soft delete)' })
  async deleteTemplate(@Param('id') id: string) {
    // Usar legacy por ahora
    return this.formsService.deleteTemplate(id);
  }

  // ========================================
  // PARSING - PDF/EXCEL → TEMPLATE
  // ========================================

  @Post('templates/parse')
  @ApiOperation({
    summary: 'Generar template desde PDF o Excel',
    description:
      'Sube un PDF o Excel y el sistema generará automáticamente un template de formulario',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  parseAndCreateTemplate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(pdf|xlsx|xls)$/,
          }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    // Usar legacy por ahora
    return this.formsService.parseAndCreateTemplate({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
  }

  // ========================================
  // SUBMISSIONS (Formularios completados)
  // ========================================

  @Post('submit')
  @ApiOperation({ summary: 'Enviar formulario completado' })
  @ApiResponse({ status: 201, description: 'Formulario guardado exitosamente' })
  async submitForm(@Body() dto: SubmitFormDto, @CurrentUser() user: JwtPayload) {
    const submission = await this.submitFormUseCase.execute(dto, user.userId);
    return {
      id: submission.getId().getValue(),
      templateId: submission.getTemplateId().getValue(),
      status: submission.getStatus().getValue(),
      answers: submission.getAnswersObject(),
      submittedAt: submission.getSubmittedAt(),
    };
  }

  /**
   * Endpoint simplificado para técnicos en campo
   * POST /forms/fill/:templateId
   * Body: { ordenId?: string, responses: Record<string, any> }
   */
  @Post('fill/:templateId')
  @ApiOperation({
    summary: 'Llenar formulario de inspección (técnico en campo)',
    description:
      'Endpoint simplificado para que los técnicos llenen formularios de inspección directamente desde el móvil',
  })
  @ApiResponse({ status: 201, description: 'Formulario de inspección guardado' })
  async fillInspectionForm(
    @Param('templateId') templateId: string,
    @Body() body: { ordenId?: string; responses: Record<string, any>; estado?: string },
    @CurrentUser() user: JwtPayload
  ) {
    // Construir DTO compatible con el use case existente
    const dto: SubmitFormDto = {
      templateId,
      ordenId: body.ordenId,
      answers: body.responses,
      estado: (body.estado || 'completado') as any,
    };

    const submission = await this.submitFormUseCase.execute(dto, user.userId);
    return {
      success: true,
      id: submission.getId().getValue(),
      templateId: submission.getTemplateId().getValue(),
      status: submission.getStatus().getValue(),
      message: 'Formulario de inspección guardado exitosamente',
      submittedAt: submission.getSubmittedAt(),
    };
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Listar formularios completados' })
  async findAllSubmissions(@Query() query: ListSubmissionsQueryDto) {
    const submissions = await this.listSubmissionsUseCase.execute(query);
    return submissions.map(s => ({
      id: s.getId().getValue(),
      templateId: s.getTemplateId().getValue(),
      status: s.getStatus().getValue(),
      answers: s.getAnswersObject(),
      submittedAt: s.getSubmittedAt(),
      validatedAt: s.getValidatedAt(),
    }));
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Obtener formulario completado por ID' })
  async findSubmissionById(@Param('id') id: string) {
    const submission = await this.getSubmissionUseCase.execute(id);
    return {
      id: submission.getId().getValue(),
      templateId: submission.getTemplateId().getValue(),
      status: submission.getStatus().getValue(),
      answers: submission.getAnswersObject(),
      submittedAt: submission.getSubmittedAt(),
      validatedAt: submission.getValidatedAt(),
    };
  }

  // ========================================
  // PDF GENERATION
  // ========================================

  @Get('submissions/:id/pdf')
  @ApiOperation({
    summary: 'Descargar PDF de formulario de inspección completado',
    description: 'Genera y descarga un PDF profesional del formulario de inspección completado',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  @ApiResponse({ status: 404, description: 'Formulario no encontrado' })
  async downloadSubmissionPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const pdfResult = await this.formInspectionPdfService.generatePdfFromInstance(id);

    // Convertir base64 a Buffer
    const pdfBuffer = Buffer.from(pdfResult.buffer, 'base64');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfResult.filename}"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    return new StreamableFile(pdfBuffer);
  }

  // ========================================
  // LEGACY ENDPOINTS (deprecar)
  // ========================================

  @Get('instances')
  @ApiOperation({ summary: '[LEGACY] Listar formularios completados' })
  findAllInstances(
    @Query('templateId') templateId?: string,
    @Query('ordenId') ordenId?: string,
    @Query('estado') estado?: string
  ) {
    return this.formsService.findAllInstances({
      templateId,
      ordenId,
      estado,
    });
  }

  @Get('instances/:id')
  @ApiOperation({ summary: '[LEGACY] Obtener formulario completado por ID' })
  findInstanceById(@Param('id') id: string) {
    return this.formsService.findInstanceById(id);
  }
}
