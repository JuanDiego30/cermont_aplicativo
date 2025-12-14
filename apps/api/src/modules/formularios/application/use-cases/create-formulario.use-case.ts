/**
 * @useCase CreateFormularioUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FORMULARIO_REPOSITORY, IFormularioRepository, CreateFormularioDto, FormularioResponse } from '../dto';

@Injectable()
export class CreateFormularioUseCase {
  constructor(
    @Inject(FORMULARIO_REPOSITORY)
    private readonly repo: IFormularioRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateFormularioDto): Promise<{ message: string; data: FormularioResponse }> {
    const formulario = await this.repo.create(dto);

    this.eventEmitter.emit('formulario.created', { formularioId: formulario.id });

    return {
      message: 'Formulario creado',
      data: {
        id: formulario.id,
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        categoria: formulario.categoria,
        campos: formulario.campos,
        createdAt: formulario.createdAt.toISOString(),
      },
    };
  }
}
