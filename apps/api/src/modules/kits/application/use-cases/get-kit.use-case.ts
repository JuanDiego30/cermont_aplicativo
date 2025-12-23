/**
 * Use Case: GetKitUseCase
 * 
 * Obtiene un kit por ID
 */
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository } from '../../domain/repositories';
import { KitId } from '../../domain/value-objects';
import { KitResponseDto } from '../dto/kit.dtos';
import { KitMapper } from '../mappers';

@Injectable()
export class GetKitUseCase {
    constructor(
        @Inject(KIT_REPOSITORY)
        private readonly repository: IKitRepository,
    ) { }

    async execute(kitId: string): Promise<KitResponseDto> {
        const id = KitId.create(kitId);
        const kit = await this.repository.findById(id);

        if (!kit) {
            throw new NotFoundException(`Kit ${kitId} no encontrado`);
        }

        return KitMapper.toResponseDto(kit);
    }
}
