import { Module } from '@nestjs/common';
import { ArchivadoController } from './archivado.controller';
import { ArchivadoService } from './archivado.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ArchivadoController],
    providers: [ArchivadoService],
    exports: [ArchivadoService],
})
export class ArchivadoModule { }
