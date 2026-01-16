/**
 * @controller EvidenceController
 * @description Controller using Clean Architecture Use Cases
 */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  PayloadTooLargeException,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, JwtPayload } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { ListEvidenciasQueryDto, UploadEvidenciaDto } from '../../application/dto';
import {
  DeleteEvidenciaUseCase,
  DownloadEvidenciaByTokenUseCase,
  DownloadEvidenciaUseCase,
  GenerateEvidenciaDownloadTokenUseCase,
  GetEvidenciaUseCase,
  ListEvidenciasUseCase,
  UploadEvidenciaUseCase,
} from '../../application/use-cases';

@ApiTags('Evidence')
@Controller('evidence')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvidenceController {
  constructor(
    private readonly uploadUseCase: UploadEvidenciaUseCase,
    private readonly listUseCase: ListEvidenciasUseCase,
    private readonly getUseCase: GetEvidenciaUseCase,
    private readonly deleteUseCase: DeleteEvidenciaUseCase,
    private readonly downloadUseCase: DownloadEvidenciaUseCase,
    private readonly generateDownloadTokenUseCase: GenerateEvidenciaDownloadTokenUseCase,
    private readonly downloadByTokenUseCase: DownloadEvidenciaByTokenUseCase
  ) {}

  /**
   * List evidence with filters and pagination
   */
  @Get()
  @ApiOperation({ summary: 'List all evidence with optional filters' })
  @ApiResponse({ status: 200, description: 'List of evidence' })
  async findAll(@Query() query: ListEvidenciasQueryDto) {
    return this.listUseCase.execute(query);
  }

  /**
   * List evidence by order
   */
  @Get('order/:orderId')
  @ApiOperation({ summary: 'List evidence for an order' })
  async findByOrder(
    @Param('orderId') orderId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (!orderId) {
      throw new BadRequestException('orderId is required');
    }

    return this.listUseCase.execute({
      ordenId: orderId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * Download evidence file
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Download evidence file' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response
  ) {
    const { buffer, filename, mimeType } = await this.downloadUseCase.execute({
      id,
      requestedBy: user.userId,
      requesterRole: user.role,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    return new StreamableFile(buffer);
  }

  /**
   * Rule 27: temporary URL (token 1h)
   */
  @Get(':id/temp-url')
  @ApiOperation({ summary: 'Generate temporary download URL (1h)' })
  async getTempUrl(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.generateDownloadTokenUseCase.execute({
      id,
      requestedBy: user.userId,
      requesterRole: user.role,
    });
  }

  /**
   * Rule 27: download using temporary token
   */
  @Public()
  @Get('download/:token')
  @ApiOperation({ summary: 'Download evidence using temporary token' })
  async downloadByToken(@Param('token') token: string, @Res({ passthrough: true }) res: Response) {
    const { buffer, filename, mimeType } = await this.downloadByTokenUseCase.execute({ token });

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    return new StreamableFile(buffer);
  }

  /**
   * Get single evidence by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get evidence by ID' })
  @ApiResponse({ status: 200, description: 'Evidence details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  /**
   * Upload new evidence
   */
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'archivo', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ])
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new evidence (photo, video, doc)' })
  @ApiResponse({ status: 201, description: 'Evidence created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async upload(
    @UploadedFiles()
    files: {
      archivo?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
    @Body() body: Record<string, string>,
    @CurrentUser() user: JwtPayload
  ) {
    const file = files?.archivo?.[0] ?? files?.file?.[0];

    if (!file) {
      throw new BadRequestException('Archivo requerido (campo "archivo" o "file")');
    }

    const MAX_SIZE_BYTES_FALLBACK = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES_FALLBACK) {
      throw new PayloadTooLargeException('Archivo demasiado grande');
    }

    const dto: UploadEvidenciaDto = {
      ordenId: body.ordenId,
      ejecucionId: body.ejecucionId || undefined,
      tipo: (body.tipo as any) || undefined,
      descripcion: body.descripcion || undefined,
      tags: body.tags || undefined,
    };

    if (!dto.ordenId) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [{ path: ['ordenId'], message: 'ordenId es requerido' }],
      });
    }

    const result = await this.uploadUseCase.execute({
      file,
      dto,
      uploadedBy: user.userId,
      uploaderRole: user.role,
    });

    if (!result.success) {
      throw new BadRequestException({
        message: 'Upload failed',
        errors: result.errors,
      });
    }

    return result;
  }

  /**
   * Delete evidencia by ID
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete evidence' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deleteUseCase.execute(id, user.userId);
  }
}
