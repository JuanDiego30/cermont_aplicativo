import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { OfflineSyncService } from './services/offline-sync.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SyncController],
    providers: [SyncService, OfflineSyncService],
    exports: [SyncService, OfflineSyncService],
})
export class SyncModule {}
