/**
 * @controller FormsController
 *
 * API REST para gestión de formularios dinámicos.
 * - CRUD de Templates
 * - CRUD de Instancias
 * - Parsing de PDF/Excel
 */
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { FormsService } from '../../forms.service';
import type { TipoFormulario } from '.prisma/client';
import { CreateFormTemplateDto, UpdateFormTemplateDto } from '../../application/dto/form-template.dto';
import { SubmitFormDto, UpdateFormInstanceDto } from '../../application/dto/submit-form.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../../common/decorators/current-user.decorator';

@ApiTags('Forms - Motor de Formularios Dinámicos')
@Controller('forms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    // ========================================
    // TEMPLATES
    // ========================================

    @Post('templates')
    @ApiOperation({ summary: 'Crear nuevo template de formulario' })
    @ApiResponse({ status: 201, description: 'Template creado exitosamente' })
    createTemplate(@Body() dto: CreateFormTemplateDto) {
        return this.formsService.createTemplate(dto);
    }

    @Get('templates')
    @ApiOperation({ summary: 'Listar todos los templates' })
    @ApiQuery({ name: 'tipo', required: false })
    @ApiQuery({ name: 'categoria', required: false })
    @ApiQuery({ name: 'activo', required: false, type: Boolean })
    findAllTemplates(
        @Query('tipo') tipo?: string,
        @Query('categoria') categoria?: string,
        @Query('activo') activo?: string,
    ) {
        const tipoFilter = tipo as TipoFormulario | undefined;

        return this.formsService.findAllTemplates({
            tipo: tipoFilter,
            categoria,
            activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
        });
    }

    @Get('templates/:id')
    @ApiOperation({ summary: 'Obtener template por ID' })
    findTemplateById(@Param('id') id: string) {
        return this.formsService.findTemplateById(id);
    }

    @Put('templates/:id')
    @ApiOperation({ summary: 'Actualizar template' })
    updateTemplate(@Param('id') id: string, @Body() dto: UpdateFormTemplateDto) {
        return this.formsService.updateTemplate(id, dto);
    }

    @Delete('templates/:id')
    @ApiOperation({ summary: 'Desactivar template (soft delete)' })
    deleteTemplate(@Param('id') id: string) {
        return this.formsService.deleteTemplate(id);
    }

    // ========================================
    // PARSING - PDF/EXCEL → TEMPLATE
    // ========================================

    @Post('templates/parse')
    @ApiOperation({
        summary: 'Generar template desde PDF o Excel',
        description: 'Sube un PDF o Excel y el sistema generará automáticamente un template de formulario',
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
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.formsService.parseAndCreateTemplate({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
        });
    }

    // ========================================
    // INSTANCIAS (Formularios completados)
    // ========================================

    @Post('submit')
    @ApiOperation({ summary: 'Enviar formulario completado' })
    @ApiResponse({ status: 201, description: 'Formulario guardado exitosamente' })
    submitForm(@Body() dto: SubmitFormDto, @CurrentUser() user: JwtPayload) {
        return this.formsService.submitForm(dto, user.userId);
    }

    @Get('instances')
    @ApiOperation({ summary: 'Listar formularios completados' })
    @ApiQuery({ name: 'templateId', required: false })
    @ApiQuery({ name: 'ordenId', required: false })
    @ApiQuery({ name: 'estado', required: false })
    findAllInstances(
        @Query('templateId') templateId?: string,
        @Query('ordenId') ordenId?: string,
        @Query('estado') estado?: string,
    ) {
        return this.formsService.findAllInstances({ templateId, ordenId, estado });
    }

    @Get('instances/:id')
    @ApiOperation({ summary: 'Obtener formulario completado por ID' })
    findInstanceById(@Param('id') id: string) {
        return this.formsService.findInstanceById(id);
    }

    @Put('instances/:id')
    @ApiOperation({ summary: 'Actualizar formulario completado' })
    updateInstance(
        @Param('id') id: string,
        @Body() dto: UpdateFormInstanceDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.formsService.updateInstance(id, dto, user.userId);
    }

    @Delete('instances/:id')
    @ApiOperation({ summary: 'Eliminar formulario completado' })
    deleteInstance(@Param('id') id: string) {
        return this.formsService.deleteInstance(id);
    }
}
