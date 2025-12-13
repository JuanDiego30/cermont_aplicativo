/**
 * @useCase ListChecklistsUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { CHECKLIST_REPOSITORY, IChecklistRepository } from '../../domain/repositories';
import { ChecklistResponse } from '../dto';

@Injectable()
export class ListChecklistsUseCase {
  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repo: IChecklistRepository,
  ) {}

  async execute(tipo?: string): Promise<ChecklistResponse[]> {
    const checklists = tipo
      ? await this.repo.findByTipo(tipo)
      : await this.repo.findAll();

    return checklists.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      tipo: c.tipo,
      items: c.items.map((i) => ({
        id: i.id,
        descripcion: i.descripcion,
        requerido: i.requerido,
        orden: i.orden,
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }
}
