/**
 * @controller EvidenciasController
 * @description Controller using Clean Architecture Use Cases
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  PayloadTooLargeException,
  HttpStatus,
  HttpCode,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import {
  UploadEvidenciaUseCase,
  ListEvidenciasUseCase,
  GetEvidenciaUseCase,
  DeleteEvidenciaUseCase,
  DownloadEvidenciaUseCase,
  GenerateEvidenciaDownloadTokenUseCase,
  DownloadEvidenciaByTokenUseCase,
} from '../../application/use-cases';
import {
  UploadEvidenciaSchema,
  ListEvidenciasQuerySchema,
} from '../../application/dto';

@ApiTags('Evidencias')
@Controller('evidencias')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvidenciasController {
  constructor(
    private readonly uploadUseCase: UploadEvidenciaUseCase,
    private readonly listUseCase: ListEvidenciasUseCase,
    private readonly getUseCase: GetEvidenciaUseCase,
    private readonly deleteUseCase: DeleteEvidenciaUseCase,
    private readonly downloadUseCase: DownloadEvidenciaUseCase,
    private readonly generateDownloadTokenUseCase: GenerateEvidenciaDownloadTokenUseCase,
    private readonly downloadByTokenUseCase: DownloadEvidenciaByTokenUseCase,
  ) { }

  /**
   * List evidencias with filters and pagination
   */
  @Get()
  @ApiOperation({ summary: 'List all evidencias with optional filters' })
  @ApiResponse({ status: 200, description: 'List of evidencias' })
  async findAll(
    @Query('ordenId') ordenId?: string,
    @Query('ejecucionId') ejecucionId?: string,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query = ListEvidenciasQuerySchema.parse({
      ordenId,
      ejecucionId,
      tipo,
      status,
      includeDeleted: includeDeleted === 'true',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return this.listUseCase.execute(query);
  }

  /**
   * List evidencias by orden (legacy endpoint for compatibility)
   */
  @Get('orden/:ordenId')
  @ApiOperation({ summary: 'List evidencias for an orden' })
  async findByOrden(
    @Param('ordenId') ordenId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listUseCase.execute({
      ordenId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * Download evidencia file
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Download evidencia file' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.downloadUseCase.execute({
      id,
      requestedBy: user.userId,
      requesterRole: user.role,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );

    return new StreamableFile(buffer);
  }

  /**
   * Regla 27: URL temporal (token 1h)
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
   * Regla 27: descarga usando token temporal
   */
  @Public()
  @Get('download/:token')
  @ApiOperation({ summary: 'Download evidencia using temporary token' })
  async downloadByToken(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.downloadByTokenUseCase.execute({ token });

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );

    return new StreamableFile(buffer);
  }

  /**
   * Get single evidencia by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get evidencia by ID' })
  @ApiResponse({ status: 200, description: 'Evidencia details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  /**
   * Upload new evidencia
   */
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'archivo', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new evidencia (photo, video, doc)' })
  @ApiResponse({ status: 201, description: 'Evidencia created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async upload(
    @UploadedFiles()
    files: {
      archivo?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
    @Body() body: Record<string, string>,
    @CurrentUser() user: JwtPayload,
  ) {
    const file = files?.archivo?.[0] ?? files?.file?.[0];

    if (!file) {
      throw new BadRequestException('Archivo requerido (campo "archivo" o "file")');
    }

    // Multer enforces the hard upper bound. Domain validation enforces per-type limits.
    // If the file already exceeds Multer limits, it may not reach this handler.
    // Keep a minimal fallback to return 413 when `file.size` is unexpectedly huge.
    const MAX_SIZE_BYTES_FALLBACK = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES_FALLBACK) {
      throw new PayloadTooLargeException('Archivo demasiado grande');
    }

    // Parse and validate body with Zod
    const parseResult = UploadEvidenciaSchema.safeParse({
      ordenId: body.ordenId,
      ejecucionId: body.ejecucionId || undefined,
      tipo: body.tipo || undefined,
      descripcion: body.descripcion || undefined,
      tags: body.tags || undefined,
    });

    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: parseResult.error.issues,
      });
    }

    const result = await this.uploadUseCase.execute({
      file,
      dto: parseResult.data,
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
   * Delete evidencia (soft delete by default)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete evidencia (soft delete)' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async remove(
    @Param('id') id: string,
    @Query('permanent') permanent: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.deleteUseCase.execute(id, user.userId, permanent === 'true');
  }
}
