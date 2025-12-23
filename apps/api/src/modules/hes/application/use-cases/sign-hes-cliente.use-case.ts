/**
 * Use Case: SignHESClienteUseCase
 * 
 * Firma una HES por parte del cliente
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HES } from '../../domain/entities/hes.entity';
import { HESId } from '../../domain/value-objects/hes-id.vo';
import { FirmaDigital } from '../../domain/entities/firma-digital.entity';
import { IHESRepository, HES_REPOSITORY } from '../../domain/repositories';
import { SignHESDto } from '../dto/sign-hes.dto';

@Injectable()
export class SignHESClienteUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(hesId: string, dto: SignHESDto, ipAddress?: string, userAgent?: string): Promise<HES> {
    const id = HESId.create(hesId);
    const hes = await this.repository.findById(id);

    if (!hes) {
      throw new NotFoundException(`HES no encontrada: ${hesId}`);
    }

    // Crear firma digital
    const firma = FirmaDigital.create({
      imagenBase64: dto.imagenBase64,
      firmadoPor: dto.firmadoPor,
      identificacion: dto.identificacion,
      ipAddress,
      userAgent,
    });

    // Firmar
    hes.firmarPorCliente(firma);

    // Guardar
    const saved = await this.repository.save(hes);

    // Publicar eventos
    const domainEvents = saved.getDomainEvents();
    for (const event of domainEvents) {
      this.eventEmitter.emit(event.constructor.name, event);
    }
    saved.clearDomainEvents();

    return saved;
  }
}

