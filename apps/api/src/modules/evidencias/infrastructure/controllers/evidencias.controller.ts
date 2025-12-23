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
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../../../common/decorators/current-user.decorator';
import {
  UploadEvidenciaUseCase,
  ListEvidenciasUseCase,
  GetEvidenciaUseCase,
  DeleteEvidenciaUseCase,
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
   * Upload new evidencia
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new evidencia (photo, video, doc)' })
  @ApiResponse({ status: 201, description: 'Evidencia created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB max
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: Record<string, string>,
    @CurrentUser() user: JwtPayload,
  ) {
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
