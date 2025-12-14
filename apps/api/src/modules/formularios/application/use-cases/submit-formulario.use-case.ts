/**
 * @useCase SubmitFormularioUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FORMULARIO_REPOSITORY, IFormularioRepository, SubmitFormularioDto } from '../dto';

@Injectable()
export class SubmitFormularioUseCase {
  constructor(
    @Inject(FORMULARIO_REPOSITORY)
    private readonly repo: IFormularioRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: SubmitFormularioDto, userId: string): Promise<{ message: string; id: string }> {
    const respuesta = await this.repo.submitRespuesta(dto, userId);

    this.eventEmitter.emit('formulario.submitted', {
      respuestaId: respuesta.id,
      formularioId: dto.formularioId,
      ordenId: dto.ordenId,
    });

    return {
      message: 'Formulario enviado',
      id: respuesta.id,
    };
  }
}
