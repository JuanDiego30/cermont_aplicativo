/**
 * @barrel Sync Module Exports
 *
 * Exportaciones del módulo de sincronización offline/online.
 */

// Services
export { SyncService } from './sync.service';
export { OfflineSyncService } from './services/offline-sync.service';

// Interfaces
export {
  ISyncState,
  ISyncError,
  ISyncMetrics,
  ISyncResult,
  ISyncConflict,
  IOfflinePayload,
  IOfflineChecklistItem,
  SyncStatus,
} from './interfaces/sync-state.interface';

// DTOs
export {
  CreateOfflineChecklistDto,
  SyncPayloadDto,
  SyncResultDto,
  OfflinePayloadResponseDto,
  OfflineChecklistItemDto,
  UbicacionGPSDto,
  ValidateSyncIntegrityDto,
  ForceResyncDto,
  EstadoItemChecklist,
} from './dto/offline-checklist.dto';

// Module
export { SyncModule } from './sync.module';
