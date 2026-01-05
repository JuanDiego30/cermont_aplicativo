/**
 * Use Case: DeactivateKitUseCase
 *
 * Desactiva un kit
 */
import { Injectable, NotFoundException, Inject, Logger } from "@nestjs/common";
import { KIT_REPOSITORY, IKitRepository } from "../../domain/repositories";
import { KitId } from "../../domain/value-objects";
import { KitResponseDto } from "../dto/kit.dtos";
import { KitMapper } from "../mappers";

@Injectable()
export class DeactivateKitUseCase {
  private readonly logger = new Logger(DeactivateKitUseCase.name);

  constructor(
    @Inject(KIT_REPOSITORY)
    private readonly repository: IKitRepository,
  ) {}

  async execute(kitId: string): Promise<KitResponseDto> {
    this.logger.log(`Deactivating kit: ${kitId}`);

    const id = KitId.create(kitId);
    const kit = await this.repository.findById(id);

    if (!kit) {
      throw new NotFoundException(`Kit ${kitId} no encontrado`);
    }

    kit.deactivate();

    const saved = await this.repository.save(kit);

    this.logger.log(`Kit deactivated: ${kitId}`);

    return KitMapper.toResponseDto(saved);
  }
}
