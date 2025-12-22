/**
 * Use Case: ActualizarPreferenciasUseCase
 * 
 * Actualiza preferencias de alertas del usuario
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IPreferenciaAlertaRepository,
  PREFERENCIA_ALERTA_REPOSITORY,
} from '../../domain/repositories/preferencia-alerta.repository.interface';
import { PreferenciaAlerta } from '../../domain/entities/preferencia-alerta.entity';
import { PreferenciaActualizadaEvent } from '../../domain/events/preferencia-actualizada.event';
import { ActualizarPreferenciasDto } from '../dto/preferencias-alerta.dto';
import { PreferenciaResponseDto } from '../dto/preferencias-alerta.dto';
import { PreferenciaMapper } from '../mappers/preferencia.mapper';

@Injectable()
export class ActualizarPreferenciasUseCase {
  private readonly logger = new Logger(ActualizarPreferenciasUseCase.name);

  constructor(
    @Inject(PREFERENCIA_ALERTA_REPOSITORY)
    private readonly preferenciaRepository: IPreferenciaAlertaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    usuarioId: string,
    dto: ActualizarPreferenciasDto,
  ): Promise<PreferenciaResponseDto> {
    // Buscar preferencias existentes
    let preferencia = await this.preferenciaRepository.findByUsuarioYTipo(
      usuarioId,
      dto.tipoAlerta,
    );

    // Crear o actualizar
    if (!preferencia) {
      preferencia = PreferenciaAlerta.create({
        usuarioId,
        tipoAlerta: dto.tipoAlerta,
        canalesPreferidos: dto.canalesPreferidos,
        noMolestar: dto.noMolestar,
        horariosPermitidos: dto.horariosPermitidos as { inicio: string; fin: string } | undefined,
      });
    } else {
      preferencia.actualizarCanales(dto.canalesPreferidos);
      if (dto.noMolestar !== undefined) {
        if (dto.noMolestar) {
          preferencia.activarNoMolestar();
        } else {
          preferencia.desactivarNoMolestar();
        }
      }
      if (dto.horariosPermitidos !== undefined) {
        preferencia.actualizarHorarios(dto.horariosPermitidos as { inicio: string; fin: string });
      }
    }

    // Guardar
    const savedPreferencia = await this.preferenciaRepository.save(preferencia);

    // Publicar evento
    const event = new PreferenciaActualizadaEvent({
      usuarioId,
      cambios: {
        tipoAlerta: dto.tipoAlerta,
        canalesPreferidos: dto.canalesPreferidos,
        noMolestar: dto.noMolestar,
        horariosPermitidos: dto.horariosPermitidos,
      },
      timestamp: new Date(),
    });
    this.eventEmitter.emit(event.eventName, event);

    this.logger.log(`Preferencias actualizadas para usuario ${usuarioId}`);

    return PreferenciaMapper.toResponseDto(savedPreferencia);
  }
}

