/**
 * @useCase AprobarCierreUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CIERRE_REPOSITORY, ICierreRepository } from '../dto';

@Injectable()
export class AprobarCierreUseCase {
  constructor(
    @Inject(CIERRE_REPOSITORY)
    private readonly repo: ICierreRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(cierreId: string, userId: string): Promise<{ message: string }> {
    await this.repo.aprobar(cierreId, userId);

    this.eventEmitter.emit('cierre.aprobado', { cierreId, userId });

    return { message: 'Cierre administrativo aprobado' };
  }
}
