import { Injectable, Inject } from '@nestjs/common';
import { EJECUCION_REPOSITORY, IEjecucionRepository } from '../../domain/repositories';
import { Ejecucion } from '../../domain/entities';

@Injectable()
export class GetMisEjecucionesUseCase {
    constructor(
        @Inject(EJECUCION_REPOSITORY)
        private readonly repository: IEjecucionRepository,
    ) { }

    async execute(userId: string): Promise<any[]> {
        const ejecuciones = await this.repository.findByTecnico(userId);
        // Map to response if needed, for now returning entity or raw
        // Ideally map to DTO
        return ejecuciones.map(e => ({
            id: e.getId().getValue(),
            ordenId: e.getOrdenId(),
            estado: e.getStatus().getValue(),
            avance: e.getProgress().getValue(),
            updatedAt: e.getUpdatedAt(),
        }));
    }
}
