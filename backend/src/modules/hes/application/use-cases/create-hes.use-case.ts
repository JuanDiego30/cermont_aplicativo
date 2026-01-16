/**
 * Use Case: CreateHESUseCase
 *
 * Crea una nueva HES
 */

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HES } from '../../domain/entities/hes.entity';
import { NumeroHESDuplicadoException } from '../../domain/exceptions';
import { HES_REPOSITORY, IHESRepository } from '../../domain/repositories';
import { CreateHESDto } from '../dto/create-hes.dto';
import { HESMapper } from '../mappers/hes.mapper';
import { HESNumeroGeneratorService } from '../services/hes-numero-generator.service';

@Injectable()
export class CreateHESUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
    private readonly numeroGenerator: HESNumeroGeneratorService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: CreateHESDto, creadoPor: string): Promise<HES> {
    // Verificar que no exista HES para esta orden
    const existing = await this.repository.findByOrden(dto.ordenId);
    if (existing) {
      throw new ConflictException(`Ya existe una HES para la orden ${dto.ordenId}`);
    }

    // Generar número único
    const year = new Date().getFullYear();
    const numero = await this.numeroGenerator.generateNext(year);

    // Verificar que no exista
    const exists = await this.numeroGenerator.exists(numero);
    if (exists) {
      throw new NumeroHESDuplicadoException(numero.getValue());
    }

    // Crear HES
    const hes = HESMapper.toDomain(dto, creadoPor, undefined, year);
    (hes as any)._numero = numero; // Asignar número generado

    // Guardar
    const saved = await this.repository.save(hes);

    // Publicar eventos de dominio
    const domainEvents = saved.getDomainEvents();
    for (const event of domainEvents) {
      this.eventEmitter.emit(event.constructor.name, event);
    }
    saved.clearDomainEvents();

    return saved;
  }
}
