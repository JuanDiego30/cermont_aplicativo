/**
 * @controller EvidenciasController
 * @description Controlador de evidencias con Clean Architecture
 */
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../../../common/decorators/current-user.decorator';
import {
  UploadEvidenciaUseCase,
  ListEvidenciasByOrdenUseCase,
  DeleteEvidenciaUseCase,
} from '../../application/use-cases';
import { UploadEvidenciaSchema } from '../../application/dto/evidencia.dto';

// Para tipado de Multer
import { Express } from 'express';
import 'multer';

@ApiTags('Evidencias')
@Controller('evidencias')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvidenciasController {
  constructor(
    private readonly uploadUseCase: UploadEvidenciaUseCase,
    private readonly listUseCase: ListEvidenciasByOrdenUseCase,
    private readonly deleteUseCase: DeleteEvidenciaUseCase,
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo')) // Nombre del campo en form-data
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir nueva evidencia (foto, video, doc)' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Max 20MB
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          // Allow images, videos, pdf
          // new FileTypeValidator({ fileType: '.(jpg|jpeg|png|mp4|pdf|doc|docx)' }), 
          // Basic validator, can be stricter
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() body: any, // Multer body is 'any' sometimes, we parse it
    @CurrentUser() user: JwtPayload,
  ) {
    // Validar DTO con Zod
    // Multer envia el body como objeto plano, pero sus valores son strings.
    // Zod coercion podría ayudar, o parse manual.
    // Asumimos que cliente envia JSON en campos o campos individuales.

    // Convertir empty strings a undefined para Zod defaults
    const payload = {
      ordenId: body.ordenId,
      ejecucionId: body.ejecucionId || undefined,
      tipo: body.tipo || undefined,
      descripcion: body.descripcion || undefined,
      tags: body.tags || undefined,
    };

    const dto = UploadEvidenciaSchema.parse(payload);

    return this.uploadUseCase.execute(dto, file, user.userId);
  }

  @Get('orden/:ordenId')
  @ApiOperation({ summary: 'Listar evidencias de una orden' })
  async findByOrden(@Param('ordenId') ordenId: string) {
    return this.listUseCase.execute(ordenId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar evidencia' })
  async remove(@Param('id') id: string) {
    return this.deleteUseCase.execute(id);
  }
}
