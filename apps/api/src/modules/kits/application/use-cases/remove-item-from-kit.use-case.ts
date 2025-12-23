/**
 * Use Case: RemoveItemFromKitUseCase
 * 
 * Elimina un item de un kit
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository } from '../../domain/repositories';
import { KitId } from '../../domain/value-objects';
import { KitResponseDto } from '../dto/kit.dtos';
import { KitMapper } from '../mappers';

@Injectable()
export class RemoveItemFromKitUseCase {
    private readonly logger = new Logger(RemoveItemFromKitUseCase.name);

    constructor(
        @Inject(KIT_REPOSITORY)
        private readonly repository: IKitRepository,
    ) { }

    async execute(kitId: string, itemId: string): Promise<KitResponseDto> {
        this.logger.log(`Removing item ${itemId} from kit: ${kitId}`);

        const id = KitId.create(kitId);
        const kit = await this.repository.findById(id);

        if (!kit) {
            throw new NotFoundException(`Kit ${kitId} no encontrado`);
        }

        kit.removeItem(itemId);

        const saved = await this.repository.save(kit);

        this.logger.log(`Item removed from kit: ${kitId}`);

        return KitMapper.toResponseDto(saved);
    }
}
