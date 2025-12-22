import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ArchivadoController } from './infrastructure/controllers/archivado.controller';
import { ArchivadoService } from './archivado.service';
import { ARCHIVADO_REPOSITORY } from './application/dto';
import { PrismaArchivadoRepository } from './infrastructure/persistence';
import { ARCHIVED_ORDER_REPOSITORY } from './domain';
import { ArchivedOrderRepository } from './infrastructure/persistence/archived-order.repository';
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
    // Legacy repository
    {
      provide: ARCHIVADO_REPOSITORY,
      useClass: PrismaArchivadoRepository,
    },
    // New DDD repository
    {
      provide: ARCHIVED_ORDER_REPOSITORY,
      useClass: ArchivedOrderRepository,
    },
    ListArchivadasUseCase,
    ArchivarOrdenUseCase,
    DesarchivarOrdenUseCase,
  ],
  exports: [ArchivadoService],
})
export class ArchivadoModule { }

