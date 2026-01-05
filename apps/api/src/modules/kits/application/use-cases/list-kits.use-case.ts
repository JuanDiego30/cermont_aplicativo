/**
 * Use Case: ListKitsUseCase
 *
 * Lista kits con filtros opcionales
 */
import { Injectable, Inject, Logger } from "@nestjs/common";
import { KIT_REPOSITORY, IKitRepository } from "../../domain/repositories";
import { CategoriaKit } from "../../domain/value-objects";
import {
  ListKitsQueryDto,
  KitResponseDto,
  KitListResponseDto,
} from "../dto/kit.dtos";
import { KitMapper } from "../mappers";

@Injectable()
export class ListKitsUseCase {
  private readonly logger = new Logger(ListKitsUseCase.name);

  constructor(
    @Inject(KIT_REPOSITORY)
    private readonly repository: IKitRepository,
  ) {}

  async execute(query: ListKitsQueryDto): Promise<KitListResponseDto> {
    this.logger.debug(`Listing kits with query: ${JSON.stringify(query)}`);

    let kits;

    if (query.categoria) {
      const categoria = CategoriaKit.create(query.categoria);
      kits = await this.repository.findByCategoria(categoria);
    } else if (query.soloPlantillas) {
      kits = await this.repository.findTemplates();
    } else {
      kits = await this.repository.findAllActive();
    }

    // Apply estado filter if provided
    if (query.estado) {
      kits = kits.filter((k) => k.getEstado().getValue() === query.estado);
    }

    // Apply tipo filter if provided
    if (query.tipo) {
      kits = kits.filter((k) => k.getTipo().getValue() === query.tipo);
    }

    const data = kits.map((kit) => KitMapper.toResponseDto(kit));

    return {
      data,
      total: data.length,
    };
  }
}
