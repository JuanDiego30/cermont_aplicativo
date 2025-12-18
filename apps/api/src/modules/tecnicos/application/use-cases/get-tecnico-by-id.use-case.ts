/**
 * @use-case GetTecnicoByIdUseCase
 * @description Get a technician by ID
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITecnicoRepository, TECNICO_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetTecnicoByIdUseCase {
    constructor(
        @Inject(TECNICO_REPOSITORY)
        private readonly tecnicoRepository: ITecnicoRepository,
    ) { }

    async execute(id: string): Promise<any> {
        const tecnico = await this.tecnicoRepository.findById(id);

        if (!tecnico) {
            throw new NotFoundException(`Técnico con ID ${id} no encontrado`);
        }

        return tecnico.toJSON();
    }
}
