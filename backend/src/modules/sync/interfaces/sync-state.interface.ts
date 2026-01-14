/**
 * @interfaces Sync State
 *
 * Interfaces para gestionar estados de sincronización offline/online.
 * Uso: Técnicos en campo sincronizando datos sin conexión.
 */

export interface ISyncState {
  /** Identificador único del dispositivo */
  deviceId: string;

  /** Estado actual de la sincronización */
  status: SyncStatus;

  /** Timestamp de la última sincronización exitosa */
  lastSyncAt: Date | null;

  /** Número de items pendientes de sincronizar */
  pendingItems: number;

  /** Si hay sincronización en progreso */
  isSyncing: boolean;

  /** Porcentaje de progreso (0-100) */
  progress: number;

  /** Errores acumulados */
  errors: ISyncError[];
}

export type SyncStatus =
  | "IDLE" // Sin actividad
  | "SYNCING" // Sincronizando
  | "SUCCESS" // Último sync exitoso
  | "PARTIAL" // Sync parcial (algunos errores)
  | "FAILED" // Falló completamente
  | "OFFLINE"; // Sin conexión

export interface ISyncError {
  /** ID del item que falló */
  itemId: string;

  /** Tipo de operación que falló */
  operation: "CREATE" | "UPDATE" | "DELETE";

  /** Tipo de entidad */
  entityType: "EJECUCION" | "CHECKLIST" | "EVIDENCIA" | "TAREA" | "COSTO";

  /** Mensaje de error */
  message: string;

  /** Código de error (para debugging) */
  code: string;

  /** Número de reintentos realizados */
  retryCount: number;

  /** Timestamp del error */
  timestamp: Date;

  /** Puede reintentarse automáticamente */
  retryable: boolean;
}

export interface ISyncMetrics {
  /** Total de items sincronizados exitosamente */
  totalSynced: number;

  /** Total de items fallidos */
  totalFailed: number;

  /** Tiempo promedio de sincronización (ms) */
  avgSyncTimeMs: number;

  /** Último timestamp de sincronización */
  lastSyncTimestamp: Date | null;

  /** Items pendientes por tipo */
  pendingByType: Record<string, number>;

  /** Uso de almacenamiento local (bytes) */
  localStorageBytes: number;
}

export interface IOfflineChecklistItem {
  /** UUID del item */
  id: string;

  /** Nombre del item del checklist */
  nombre: string;

  /** Estado actual */
  estado: "pendiente" | "completado" | "rechazado";

  /** Timestamp de completado */
  completadoEn?: Date;

  /** Observaciones del técnico */
  observaciones?: string;

  /** URLs de fotos adjuntas (locales o remotas) */
  fotosAdjuntas?: string[];

  /** ID del checklist padre */
  checklistId: string;

  /** Orden de visualización */
  orden: number;
}

export interface IOfflinePayload {
  /** ID de la ejecución */
  ejecucionId: string;

  /** ID de la orden */
  ordenId: string;

  /** Número de la orden (para visualización) */
  numeroOrden: string;

  /** Items del checklist */
  items: IOfflineChecklistItem[];

  /** Timestamp de generación del payload */
  timestamp: Date;

  /** Identificador único del dispositivo */
  deviceId: string;

  /** Firma digital del técnico (base64) */
  firma?: string;

  /** Ubicación GPS al momento de generar */
  ubicacionGPS?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };

  /** Versión del schema (para migraciones futuras) */
  schemaVersion: number;
}

export interface ISyncConflict {
  /** ID del item en conflicto */
  itemId: string;

  /** Tipo de entidad */
  entityType: string;

  /** Valor local (offline) */
  localValue: unknown;

  /** Valor del servidor */
  serverValue: unknown;

  /** Timestamp local */
  localTimestamp: Date;

  /** Timestamp del servidor */
  serverTimestamp: Date;

  /** Estrategia de resolución sugerida */
  suggestedResolution: "LOCAL" | "SERVER" | "MERGE" | "MANUAL";
}

export interface ISyncResult {
  /** Éxito de la operación */
  success: boolean;

  /** ID del item procesado */
  id: string;

  /** Tipo de entidad */
  tipo: string;

  /** Mensaje descriptivo */
  mensaje: string;

  /** Nuevo ID asignado (para creates) */
  nuevoId?: string;

  /** Conflictos detectados */
  conflicts?: ISyncConflict[];

  /** Tiempo de procesamiento (ms) */
  processingTimeMs?: number;
}
