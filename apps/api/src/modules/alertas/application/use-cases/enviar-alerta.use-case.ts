/**
 * Use Case: EnviarAlertaUseCase
 * 
 * Responsabilidad: Enviar una alerta a un usuario
 * 
 * Flujo:
 * 1. Validar DTO
 * 2. Obtener preferencias del usuario
 * 3. Crear entidad Alerta
 * 4. Filtrar canales según preferencias
 * 5. Guardar en BD
 * 6. Encolar para envío asíncrono
 * 7. Publicar eventos
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationQueueService } from '../../infrastructure/queue/notification-queue.service';
import {
  IAlertaRepository,
  ALERTA_REPOSITORY,
} from '../../domain/repositories/alerta.repository.interface';
import {
  IPreferenciaAlertaRepository,
  PREFERENCIA_ALERTA_REPOSITORY,
} from '../../domain/repositories/preferencia-alerta.repository.interface';
import { Alerta } from '../../domain/entities/alerta.entity';
import { CanalNotificacion } from '../../domain/value-objects/canal-notificacion.vo';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';
import { EnviarAlertaDto } from '../dto/enviar-alerta.dto';
import { AlertaResponseDto } from '../dto/alerta-response.dto';
import { AlertaMapper } from '../mappers/alerta.mapper';

@Injectable()
export class EnviarAlertaUseCase {
  private readonly logger = new Logger(EnviarAlertaUseCase.name);

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
    @Inject(PREFERENCIA_ALERTA_REPOSITORY)
    private readonly preferenciaRepository: IPreferenciaAlertaRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject('NotificationQueueService')
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  async execute(dto: EnviarAlertaDto): Promise<AlertaResponseDto> {
    const context = {
      action: 'ENVIAR_ALERTA',
      tipo: dto.tipo,
      destinatarioId: dto.destinatarioId,
    };

    this.logger.log('Enviando alerta', context);

    try {
      // 1. Obtener preferencias del usuario (si existen)
      const preferencias = await this.preferenciaRepository.findByUsuarioYTipo(
        dto.destinatarioId,
        dto.tipo,
      );

      // 2. Determinar canales a usar
      let canales: CanalNotificacionEnum[] = dto.canales || [];
      if (canales.length === 0) {
        if (!preferencias) {
          // Sin preferencias explícitas, usar canales por defecto
          canales = [CanalNotificacionEnum.EMAIL, CanalNotificacionEnum.IN_APP];
        } else {
          // Filtrar canales según preferencias y horarios
          if (preferencias.isNoMolestar()) {
            this.logger.warn(
              `Usuario ${dto.destinatarioId} tiene "no molestar" activado para ${dto.tipo}`,
            );
            canales = []; // No enviar si está en modo no molestar
          } else if (!preferencias.estaEnHorarioPermitido()) {
            this.logger.warn(
              `Usuario ${dto.destinatarioId} está fuera del horario permitido`,
            );
            canales = []; // No enviar fuera de horario
          } else {
            canales = preferencias
              .getCanalesPreferidos()
              .map((c) => c.getValue());
          }
        }
      }

      // Si no hay canales, no crear alerta
      if (canales.length === 0) {
        this.logger.warn(
          'No se pueden enviar alertas: sin canales disponibles',
          context,
        );
        throw new Error('No hay canales disponibles para enviar la alerta');
      }

      // 3. Crear entidad de dominio
      const alerta = Alerta.create({
        tipo: dto.tipo,
        prioridad: dto.prioridad,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        destinatarioId: dto.destinatarioId,
        canales,
        metadata: dto.metadata,
      });

      // 4. Guardar en BD
      const savedAlerta = await this.alertaRepository.save(alerta);

      // 5. Encolar para envío asíncrono
      await this.notificationQueue.enqueue({
        alertaId: savedAlerta.getId().getValue(),
        canales: savedAlerta.getCanales().map((c) => c.getValue()),
      });

      // 6. Publicar eventos de dominio
      const domainEvents = savedAlerta.getDomainEvents();
      for (const event of domainEvents) {
        this.eventEmitter.emit(event.eventName, event);
      }
      savedAlerta.clearDomainEvents();

      this.logger.log('Alerta creada y encolada exitosamente', {
        ...context,
        alertaId: savedAlerta.getId().getValue(),
      });

      // 7. Retornar DTO
      return AlertaMapper.toResponseDto(savedAlerta);
    } catch (error) {
      this.logger.error('Error enviando alerta', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

