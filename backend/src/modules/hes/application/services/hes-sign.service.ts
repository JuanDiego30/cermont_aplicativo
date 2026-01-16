/**
 * HesSignService
 *
 * Servicio compartido para firma de HES por cliente o técnico.
 * Elimina duplicación entre SignHESClienteUseCase y SignHESTecnicoUseCase.
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HES } from '../../domain/entities/hes.entity';
import { HESId } from '../../domain/value-objects/hes-id.vo';
import { FirmaDigital } from '../../domain/entities/firma-digital.entity';
import { IHESRepository, HES_REPOSITORY } from '../../domain/repositories';
import { SignHESDto } from '../dto/sign-hes.dto';

export type SignerType = 'cliente' | 'tecnico';

export interface SignHESParams {
  hesId: string;
  dto: SignHESDto;
  signerType: SignerType;
  tecnicoId?: string; // Solo requerido para signerType === 'tecnico'
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class HesSignService {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async sign(params: SignHESParams): Promise<HES> {
    const { hesId, dto, signerType, tecnicoId, ipAddress, userAgent } = params;

    // 1. Obtener HES
    const id = HESId.create(hesId);
    const hes = await this.repository.findById(id);

    if (!hes) {
      throw new NotFoundException(`HES no encontrada: ${hesId}`);
    }

    // 2. Crear firma digital
    const firma = FirmaDigital.create({
      imagenBase64: dto.imagenBase64,
      firmadoPor: dto.firmadoPor,
      identificacion: dto.identificacion,
      ipAddress,
      userAgent,
    });

    // 3. Aplicar firma según tipo
    if (signerType === 'cliente') {
      hes.firmarPorCliente(firma);
    } else {
      if (!tecnicoId) {
        throw new Error('tecnicoId es requerido para firma de técnico');
      }
      hes.firmarPorTecnico(firma, tecnicoId);
    }

    // 4. Guardar
    const saved = await this.repository.save(hes);

    // 5. Publicar eventos
    this.publishDomainEvents(saved);

    return saved;
  }

  private publishDomainEvents(hes: HES): void {
    const domainEvents = hes.getDomainEvents();
    for (const event of domainEvents) {
      this.eventEmitter.emit(event.constructor.name, event);
    }
    hes.clearDomainEvents();
  }
}
