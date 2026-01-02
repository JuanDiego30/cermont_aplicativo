---
description: "Agente especializado para el módulo Sync de Cermont (apps/api/src/modules/sync): sincronización offline/online, colas de cambios, conflicto resolution, consistencia de datos. CRÍTICO: integridad + performance."
tools: []
---

# CERMONT BACKEND — SYNC MODULE AGENT

## Qué hace (accomplishes)
Maneja la sincronización de datos entre dispositivos offline y servidor: colas de cambios, resolución de conflictos, reintento de fallos, y garantía de consistencia.  
Es crítico porque móviles/campo pueden perder conexión y no pueden bloquearse.

## Scope (dónde trabaja)
- Scope: `apps/api/src/modules/sync/**` (queue service, conflict resolver, SyncLog repository).  
- Integración: `ordenes`, `evidencias`, `formularios`, `dispositivos`.

## Cuándo usarlo
- Cambios en la lógica de sync (qué eventos sincronizar, qué prioridad).  
- Manejo de conflictos (último escritor gana, merge, user elige).  
- Performance: optimizar colas, evitar duplicados, batching.  
- Recovery: qué pasa si sync se interrumpe, reintento.

## Límites (CRÍTICOS)
- No pierde cambios: todo se registra en cola aunque falle upload.  
- No deja datos inconsistentes: versioning + timestamps en cada cambio.  
- No sincroniza datos borrados sin confirmación (soft delete).  
- No permite que conflictos bloqueen todo; usa estrategia clara (LWW, merge, etc).

## Arquitectura Sync (patrón obligatorio)

### Eventos a Sincronizar
```typescript
export enum SyncEventType {
  ORDEN_CREADA = 'ORDEN_CREADA',
  ORDEN_ACTUALIZADA = 'ORDEN_ACTUALIZADA',
  ORDEN_ESTADO_CAMBIO = 'ORDEN_ESTADO_CAMBIO',
  FORMULARIO_COMPLETADO = 'FORMULARIO_COMPLETADO',
  EVIDENCIA_SUBIDA = 'EVIDENCIA_SUBIDA',
  TECNICO_UBICACION = 'TECNICO_UBICACION'
}

export interface SyncEvent {
  id: string;
  tipo: SyncEventType;
  entityId: string; // ID de la orden, evidencia, etc
  entityType: string; // 'orden', 'formulario', etc
  payload: Record<string, any>;
  timestamp: Date;
  version: number; // Para resolver conflictos
  deviceId: string; // Qué dispositivo generó el evento
  usuario: string;
}
```

### SyncQueue (BD local en dispositivo + servidor)
```typescript
@Injectable()
export class SyncQueueService {
  constructor(
    private queueRepo: SyncQueueRepository,
    private conflictResolver: ConflictResolverService,
    private logger: LoggerService
  ) {}
  
  // En dispositivo: agregar a cola local
  async enqueueOffline(evento: SyncEvent): Promise<void> {
    await this.queueRepo.add({
      ...evento,
      estado: 'PENDIENTE',
      intentos: 0,
      ultimoIntento: null
    });
    this.logger.log(`Evento encolado (offline): ${evento.tipo}`, 'SyncQueueService');
  }
  
  // En servidor: recibir cola
  async procesarColaDelDispositivo(deviceId: string, eventos: SyncEvent[]): Promise<SyncResult> {
    const resultados: SyncResult = { exitosos: [], fallidos: [], conflictos: [] };
    
    for (const evento of eventos) {
      try {
        // 1. Verificar si ya existe (duplicado)
        const existe = await this.queueRepo.findByIdempotency(evento.id, deviceId);
        if (existe && existe.estado === 'PROCESADO') {
          this.logger.warn(`Evento duplicado ignorado: ${evento.id}`, 'SyncQueueService');
          resultados.exitosos.push(evento.id);
          continue;
        }
        
        // 2. Validar versión (detectar conflicto)
        const ultimaVersion = await this.obtenerUltimaVersion(evento.entityType, evento.entityId);
        if (evento.version < ultimaVersion) {
          // Hay conflicto
          const resolucion = await this.conflictResolver.resolver(evento, ultimaVersion);
          if (resolucion.aceptar) {
            resultados.exitosos.push(evento.id);
          } else {
            resultados.conflictos.push({ eventoId: evento.id, razon: resolucion.razon });
          }
        } else {
          // Sin conflicto
          resultados.exitosos.push(evento.id);
        }
        
      } catch (error) {
        this.logger.error(`Error procesando evento ${evento.id}: ${error.message}`, error);
        resultados.fallidos.push({ eventoId: evento.id, error: error.message });
      }
    }
    
    return resultados;
  }
}
```

### Conflict Resolver (Last-Writer-Wins por defecto, configurable)
```typescript
@Injectable()
export class ConflictResolverService {
  
  async resolver(eventoLocal: SyncEvent, versionServidor: number): Promise<ResolucionConflicto> {
    // Estrategia 1: Last-Writer-Wins (más simple)
    if (eventoLocal.timestamp > new Date(versionServidor)) {
      return { aceptar: true };
    }
    
    // Estrategia 2: Pedir al usuario
    return {
      aceptar: false,
      razon: 'Conflicto manual: datos local vs servidor. Requiere decisión del usuario.'
    };
  }
}
```

### DTO de Sync
```typescript
export class SincronizarDto {
  @IsUUID()
  deviceId: string;
  
  @IsArray()
  eventos: SyncEvent[];
  
  @IsDateString()
  ultimaSincronizacion: Date;
}

export class SyncResultDto {
  exitosos: string[];
  fallidos: Array<{ eventoId: string; error: string }>;
  conflictos: Array<{ eventoId: string; razon: string }>;
  cambiosDelServidor?: SyncEvent[];
}
```

## Reglas GEMINI críticas para Sync
- Regla 1: NO duplicar lógica de conflictos; centralizar en `ConflictResolverService`.  
- Regla 2: Base class para procesadores de eventos.  
- Regla 5: try/catch en procesar eventos + Logger detallado.  
- Regla 8: Funciones pequeñas; resolver conflicto, procesar evento, etc.  
- Regla 13: Paginación en cambios pendientes (no enviar mega-payloads).

## Entradas ideales (qué confirmar)
- Eventos a sincronizar (qué acciones del usuario generan sync).  
- Estrategia de conflictos (LWW, merge, manual).  
- Restricciones: "sin librerías de sync complejas", "simple", etc.

## Salidas esperadas (output)
- Servicio de cola + conflict resolver.  
- DTOs de sincronización.  
- Tests: sin duplicados, conflictos resueltos, reintento.

## Checklist Sync "Done"
- ✅ Colas procesadas sin perder eventos (idempotency).  
- ✅ Versioning en cada cambio (evitar sobrescribir).  
- ✅ Conflicto resolver funciona (LWW o merge).  
- ✅ Reintento automático si falla.  
- ✅ Historial de sync (auditoría).  
- ✅ Tests: eventos duplicados, conflictos, reintento.
