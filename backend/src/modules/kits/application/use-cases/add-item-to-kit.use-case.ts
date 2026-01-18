/**
 * Use Case: AddItemToKitUseCase
 *
 * Agrega un item a un kit existente
 */
import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository } from '../../domain/repositories';
import { KitId } from '../../domain/value-objects';
import { AddItemToKitDto, KitResponseDto } from '../dto/kit.dtos';
import { KitMapper } from '../mappers';

@Injectable()
export class AddItemToKitUseCase {
  private readonly logger = new Logger(AddItemToKitUseCase.name);

  constructor(
    @Inject(KIT_REPOSITORY)
    private readonly repository: IKitRepository
  ) {}

  async execute(kitId: string, dto: AddItemToKitDto): Promise<KitResponseDto> {
    this.logger.log(`Adding item to kit: ${kitId}`);

    const id = KitId.create(kitId);
    const kit = await this.repository.findById(id);

    if (!kit) {
      throw new NotFoundException(`Kit ${kitId} no encontrado`);
    }

    kit.addItem({
      nombre: dto.nombre,
      cantidad: dto.cantidad,
      itemType: dto.itemType || 'HERRAMIENTA',
      costoUnitario: dto.costoUnitario,
      unidad: dto.unidad,
      esOpcional: dto.esOpcional,
      requiereCertificacion: dto.requiereCertificacion,
      notas: dto.notas,
    });

    const saved = await this.repository.save(kit);

    this.logger.log(`Item added to kit: ${kitId}`);

    return KitMapper.toResponseDto(saved);
  }
}
