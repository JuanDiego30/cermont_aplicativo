/**
 * @useCase ListKitsUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository, KitResponse } from '../dto';

@Injectable()
export class ListKitsUseCase {
  constructor(
    @Inject(KIT_REPOSITORY)
    private readonly repo: IKitRepository,
  ) { }

  async execute(categoria?: string): Promise<KitResponse[]> {
    const kits = categoria
      ? await this.repo.findByCategoria(categoria)
      : await this.repo.findAll();

    return kits.map((k) => ({
      id: k.id,
      nombre: k.nombre,
      descripcion: k.descripcion,
      categoria: k.categoria,
      items: k.items,
      createdAt: k.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }
}
