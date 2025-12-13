/**
 * @controller EvidenciasController
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  ListEvidenciasUseCase,
  UploadEvidenciaUseCase,
  DeleteEvidenciaUseCase,
} from '../../application/use-cases';
import { UploadEvidenciaSchema } from '../../application/dto';

@Controller('evidencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvidenciasController {
  constructor(
    private readonly listEvidencias: ListEvidenciasUseCase,
    private readonly uploadEvidencia: UploadEvidenciaUseCase,
    private readonly deleteEvidencia: DeleteEvidenciaUseCase,
  ) {}

  @Get('orden/:ordenId')
  async findByOrden(@Param('ordenId') ordenId: string) {
    return this.listEvidencias.execute(ordenId);
  }

  @Post('orden/:ordenId')
  @Roles('admin', 'supervisor', 'tecnico')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('ordenId') ordenId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: unknown,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const result = UploadEvidenciaSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }

    const fileUrl = `/uploads/evidencias/${file.filename}`;
    return this.uploadEvidencia.execute(ordenId, req.user.id, fileUrl, result.data);
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  async remove(@Param('id') id: string) {
    return this.deleteEvidencia.execute(id);
  }
}
