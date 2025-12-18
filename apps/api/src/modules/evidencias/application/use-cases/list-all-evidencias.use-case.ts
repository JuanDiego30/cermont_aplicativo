/**
 * @useCase ListAllEvidenciasUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import {
    IEvidenciaRepository,
    EVIDENCIA_REPOSITORY,
    EvidenciaFilters,
} from '../../domain/repositories/evidencia.repository.interface';
import { EvidenciaResponse } from '../dto/evidencia.dto';

@Injectable()
export class ListAllEvidenciasUseCase {
    constructor(
        @Inject(EVIDENCIA_REPOSITORY)
        private readonly evidenciaRepository: IEvidenciaRepository,
    ) { }

    async execute(filters: EvidenciaFilters = {}): Promise<EvidenciaResponse[]> {
        const evidencias = await this.evidenciaRepository.findAll(filters);
        return evidencias.map(e => ({
            id: e.id,
            ejecucionId: e.ejecucionId,
            ordenId: e.ordenId,
            tipo: e.tipo,
            nombreArchivo: e.nombreArchivo,
            url: `/uploads/${e.nombreArchivo}`,
            descripcion: e.descripcion,
            tags: e.tags,
            subidoPor: e.subidoPor,
            createdAt: e.createdAt.toISOString(),
            sincronizado: false,
        }));
    }
}
