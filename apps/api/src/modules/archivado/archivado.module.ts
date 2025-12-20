import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ArchivadoController } from './infrastructure/controllers/archivado.controller';
import { ArchivadoService } from './archivado.service';
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
        ListArchivadasUseCase,
        ArchivarOrdenUseCase,
        DesarchivarOrdenUseCase,
    ],
    exports: [ArchivadoService],
})
export class ArchivadoModule { }
