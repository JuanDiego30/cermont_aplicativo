import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ArchivadoController } from './infrastructure/controllers/archivado.controller';
import { ArchivadoService } from './archivado.service';
import { ARCHIVADO_REPOSITORY } from './application/dto';
import { PrismaArchivadoRepository } from './infrastructure/persistence';
import {
  ListArchivadasUseCase,
  ArchivarOrdenUseCase,
  DesarchivarOrdenUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ArchivadoController],
  providers: [
    ArchivadoService,
    {
      provide: ARCHIVADO_REPOSITORY,
      useClass: PrismaArchivadoRepository,
    },
    ListArchivadasUseCase,
    ArchivarOrdenUseCase,
    DesarchivarOrdenUseCase,
  ],
  exports: [ArchivadoService],
})
export class ArchivadoModule { }
