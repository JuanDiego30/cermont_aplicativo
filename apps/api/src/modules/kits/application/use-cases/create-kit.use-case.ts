/**
 * @useCase CreateKitUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { KIT_REPOSITORY, IKitRepository, CreateKitDto, KitResponse } from '../dto';

@Injectable()
export class CreateKitUseCase {
  constructor(
    @Inject(KIT_REPOSITORY)
    private readonly repo: IKitRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateKitDto): Promise<{ message: string; data: KitResponse }> {
    const kit = await this.repo.create(dto);

    this.eventEmitter.emit('kit.created', { kitId: kit.id });

    return {
      message: 'Kit creado',
      data: {
        id: kit.id,
        nombre: kit.nombre,
        descripcion: kit.descripcion,
        categoria: kit.categoria,
        items: kit.items,
        createdAt: kit.createdAt.toISOString(),
      },
    };
  }
}
