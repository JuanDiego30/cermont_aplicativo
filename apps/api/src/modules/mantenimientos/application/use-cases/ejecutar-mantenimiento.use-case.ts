/**
 * @useCase EjecutarMantenimientoUseCase
 */
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MANTENIMIENTO_REPOSITORY, IMantenimientoRepository, EjecutarMantenimientoDto } from '../dto';

@Injectable()
export class EjecutarMantenimientoUseCase {
  constructor(
    @Inject(MANTENIMIENTO_REPOSITORY)
    private readonly repo: IMantenimientoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: EjecutarMantenimientoDto, ejecutorId: string): Promise<{ message: string }> {
    const mantenimiento = await this.repo.findById(id);
    if (!mantenimiento) throw new NotFoundException('Mantenimiento no encontrado');
    if (mantenimiento.estado === 'completado') {
      throw new BadRequestException('El mantenimiento ya fue completado');
    }
    if (mantenimiento.estado === 'cancelado') {
      throw new BadRequestException('El mantenimiento fue cancelado');
    }

    await this.repo.ejecutar(id, dto, ejecutorId);

    this.eventEmitter.emit('mantenimiento.completado', {
      mantenimientoId: id,
      equipoId: mantenimiento.equipoId,
      horasReales: dto.horasReales,
    });

    return { message: 'Mantenimiento ejecutado correctamente' };
  }
}
