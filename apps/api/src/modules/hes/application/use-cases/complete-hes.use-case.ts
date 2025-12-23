/**
 * Use Case: CompleteHESUseCase
 * 
 * Completa una HES (valida completitud y firmas)
 */

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HES } from '../../domain/entities/hes.entity';
import { HESId } from '../../domain/value-objects/hes-id.vo';
import { HESValidatorService } from '../../domain/services/hes-validator.service';
import { IHESRepository, HES_REPOSITORY } from '../../domain/repositories';
import { HESIncompletoException } from '../../domain/exceptions';

@Injectable()
export class CompleteHESUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
    private readonly validator: HESValidatorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(hesId: string): Promise<HES> {
    const id = HESId.create(hesId);
    const hes = await this.repository.findById(id);

    if (!hes) {
      throw new NotFoundException(`HES no encontrada: ${hesId}`);
    }

    // Validar completitud
    const validation = this.validator.validate(hes);
    if (!validation.isValid) {
      throw new BadRequestException(`HES incompleta: ${validation.errors.join(', ')}`);
    }

    // Completar
    try {
      hes.completar();
    } catch (error) {
      if (error instanceof HESIncompletoException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

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

