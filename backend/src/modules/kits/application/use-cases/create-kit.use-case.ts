/**
 * Use Case: CreateKitUseCase
 *
 * Crea un nuevo kit de herramientas/equipos
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { KIT_REPOSITORY, IKitRepository } from '../../domain/repositories';
import { Kit } from '../../domain/entities';
import { CreateKitDto, KitResponseDto } from '../dto/kit.dtos';
import { KitMapper } from '../mappers';

@Injectable()
export class CreateKitUseCase {
  private readonly logger = new Logger(CreateKitUseCase.name);

  constructor(
    @Inject(KIT_REPOSITORY)
    private readonly repository: IKitRepository
  ) {}

  async execute(dto: CreateKitDto, userId: string): Promise<KitResponseDto> {
    this.logger.log(`Creating kit: ${dto.nombre} by user ${userId}`);

    // Get next sequence for codigo
    const categoria = dto.categoria || 'GENERAL';
    const sequence = await this.repository.getNextSequence(categoria.substring(0, 4));

    // Convert legacy format items if present
    const items = this.buildItems(dto);

    // Create domain entity
    const kit = Kit.create(
      {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        categoria: categoria,
        tipo: dto.tipo || 'BASICO',
        duracionEstimadaHoras: dto.duracionEstimadaHoras || 0,
        esPlantilla: dto.esPlantilla || false,
        creadoPor: userId,
        items,
      },
      sequence
    );

    // Save
    const saved = await this.repository.save(kit);

    this.logger.log(`Kit created: ${saved.getId().getValue()}`);

    return KitMapper.toResponseDto(saved);
  }

  private buildItems(dto: CreateKitDto): Array<{
    nombre: string;
    cantidad: number;
    itemType: string;
    costoUnitario?: number;
    unidad?: string;
    esOpcional?: boolean;
    requiereCertificacion?: boolean;
    notas?: string;
  }> {
    const items: Array<{
      nombre: string;
      cantidad: number;
      itemType: string;
      costoUnitario?: number;
      unidad?: string;
      esOpcional?: boolean;
      requiereCertificacion?: boolean;
      notas?: string;
    }> = [];

    // From new format
    if (dto.items) {
      for (const item of dto.items) {
        items.push({
          nombre: item.nombre,
          cantidad: item.cantidad,
          itemType: item.itemType || 'HERRAMIENTA',
          costoUnitario: item.costoUnitario,
          unidad: item.unidad,
          esOpcional: item.esOpcional,
          requiereCertificacion: item.requiereCertificacion,
          notas: item.notas,
        });
      }
    }

    // From legacy herramientas
    if (dto.herramientas) {
      for (const h of dto.herramientas as Array<{
        nombre: string;
        cantidad?: number;
        certificacion?: boolean;
      }>) {
        items.push({
          nombre: h.nombre,
          cantidad: h.cantidad || 1,
          itemType: 'HERRAMIENTA',
          requiereCertificacion: h.certificacion || false,
        });
      }
    }

    // From legacy equipos
    if (dto.equipos) {
      for (const e of dto.equipos as Array<{
        nombre: string;
        cantidad?: number;
        certificacion?: boolean;
      }>) {
        items.push({
          nombre: e.nombre,
          cantidad: e.cantidad || 1,
          itemType: 'EQUIPO',
          requiereCertificacion: e.certificacion || false,
        });
      }
    }

    return items;
  }
}
