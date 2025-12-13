/**
 * @useCase CreateChecklistUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CHECKLIST_REPOSITORY, IChecklistRepository } from '../../domain/repositories';
import { CreateChecklistDto, ChecklistResponse } from '../dto';

@Injectable()
export class CreateChecklistUseCase {
  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repo: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateChecklistDto): Promise<{ message: string; data: ChecklistResponse }> {
    const checklist = await this.repo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      tipo: dto.tipo,
      items: dto.items,
    });

    this.eventEmitter.emit('checklist.created', { checklistId: checklist.id });

    return {
      message: 'Checklist creado',
      data: {
        id: checklist.id,
        nombre: checklist.nombre,
        descripcion: checklist.descripcion,
        tipo: checklist.tipo,
        items: checklist.items.map((i) => ({
          id: i.id,
          descripcion: i.descripcion,
          requerido: i.requerido,
          orden: i.orden,
        })),
        createdAt: checklist.createdAt.toISOString(),
        updatedAt: checklist.updatedAt.toISOString(),
      },
    };
  }
}
