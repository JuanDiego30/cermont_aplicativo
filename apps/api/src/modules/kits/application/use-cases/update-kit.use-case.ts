/**
 * Use Case: UpdateKitUseCase
 * 
 * Actualiza información de un kit existente
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository } from '../../domain/repositories';
import { KitId } from '../../domain/value-objects';
import { UpdateKitDto, KitResponseDto } from '../dto/kit.dtos';
import { KitMapper } from '../mappers';

@Injectable()
export class UpdateKitUseCase {
    private readonly logger = new Logger(UpdateKitUseCase.name);

    constructor(
        @Inject(KIT_REPOSITORY)
        private readonly repository: IKitRepository,
    ) { }

    async execute(kitId: string, dto: UpdateKitDto): Promise<KitResponseDto> {
        this.logger.log(`Updating kit: ${kitId}`);

        const id = KitId.create(kitId);
        const kit = await this.repository.findById(id);

        if (!kit) {
            throw new NotFoundException(`Kit ${kitId} no encontrado`);
        }

        kit.updateInfo({
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            duracionEstimadaHoras: dto.duracionEstimadaHoras,
        });

        const saved = await this.repository.save(kit);

        this.logger.log(`Kit updated: ${kitId}`);

        return KitMapper.toResponseDto(saved);
    }
}
