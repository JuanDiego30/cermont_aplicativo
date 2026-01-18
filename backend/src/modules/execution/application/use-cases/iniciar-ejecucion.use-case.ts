/**
 * @useCase IniciarEjecucionUseCase
 * Starts an execution for an order using the domain entity.
 */
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EJECUCION_REPOSITORY, IEjecucionRepository } from '../../domain/repositories';
import { Ejecucion } from '../../domain/entities';
import { GeoLocation } from '../../domain/value-objects';
import { EjecucionResponse } from '../dto';
import { toEjecucionResponse } from '../mappers/ejecucion-response.mapper';
import { PrismaService } from '../../../../prisma/prisma.service';
import { publishDomainEvents } from '../../../../shared/base/publish-domain-events';

@Injectable()
export class IniciarEjecucionUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService
  ) {}

  async execute(
    ordenId: string,
    tecnicoId: string,
    observaciones?: string,
    location?: { latitude: number; longitude: number; accuracy?: number }
  ): Promise<{ message: string; data: EjecucionResponse }> {
    // 1. Check if execution already exists
    const existing = await this.repo.exists(ordenId);
    if (existing) {
      throw new BadRequestException('Ya existe una ejecución para esta orden');
    }

    // 2. Get planeacion for the order
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    if (!planeacion || planeacion.estado !== 'aprobada') {
      throw new BadRequestException('No existe planeación aprobada para esta orden');
    }

    // 3. Create domain entity
    const ejecucion = Ejecucion.create({
      ordenId,
      planeacionId: planeacion.id,
      horasEstimadas: 8,
    });

    // 4. Start execution (State Machine)
    const geoLocation = location
      ? GeoLocation.create({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        })
      : undefined;

    ejecucion.start(tecnicoId, geoLocation, observaciones);

    // 5. Save
    const saved = await this.repo.save(ejecucion);

    // 6. Update order status
    await this.prisma.order.update({
      where: { id: ordenId },
      data: {
        estado: 'ejecucion',
        fechaInicio: new Date(),
      },
    });

    // 7. Publish domain events
    publishDomainEvents(saved, this.eventEmitter);

    return {
      message: 'Ejecución iniciada',
      data: toEjecucionResponse(saved),
    };
  }
}
