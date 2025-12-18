/**
 * @use-case ChangeDisponibilidadUseCase
 * @description Change technician availability status
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITecnicoRepository, TECNICO_REPOSITORY } from '../../domain/repositories';
import { DisponibilidadLevel } from '../../domain/value-objects';

@Injectable()
export class ChangeDisponibilidadUseCase {
    constructor(
        @Inject(TECNICO_REPOSITORY)
        private readonly tecnicoRepository: ITecnicoRepository,
    ) { }

    async execute(id: string, disponibilidad: DisponibilidadLevel): Promise<any> {
        const tecnico = await this.tecnicoRepository.findById(id);

        if (!tecnico) {
            throw new NotFoundException(`Técnico con ID ${id} no encontrado`);
        }

        tecnico.changeDisponibilidad(disponibilidad);

        const saved = await this.tecnicoRepository.save(tecnico);

        return {
            message: 'Disponibilidad actualizada exitosamente',
            data: saved.toJSON(),
        };
    }
}
