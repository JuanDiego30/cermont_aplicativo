/**
 * Use Case: DeleteKitUseCase
 * 
 * Elimina (soft delete) un kit
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository } from '../../domain/repositories';
import { KitId } from '../../domain/value-objects';

@Injectable()
export class DeleteKitUseCase {
    private readonly logger = new Logger(DeleteKitUseCase.name);

    constructor(
        @Inject(KIT_REPOSITORY)
        private readonly repository: IKitRepository,
    ) { }

    async execute(kitId: string): Promise<{ message: string }> {
        this.logger.log(`Deleting kit: ${kitId}`);

        const id = KitId.create(kitId);
        const kit = await this.repository.findById(id);

        if (!kit) {
            throw new NotFoundException(`Kit ${kitId} no encontrado`);
        }

        if (kit.esEnUso()) {
            throw new Error('No se puede eliminar un kit en uso');
        }

        await this.repository.delete(id);

        this.logger.log(`Kit deleted: ${kitId}`);

        return { message: 'Kit eliminado correctamente' };
    }
}
