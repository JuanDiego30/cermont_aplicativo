/**
 * Use Case: ExportHESPDFUseCase
 *
 * Exporta una HES a PDF
 */

import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { HES } from "../../domain/entities/hes.entity";
import { HESId } from "../../domain/value-objects/hes-id.vo";
import { IHESRepository, HES_REPOSITORY } from "../../domain/repositories";
import { HESPDFGeneratorService } from "../../infrastructure/pdf/hes-pdf-generator.service";

@Injectable()
export class ExportHESPDFUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
    private readonly pdfGenerator: HESPDFGeneratorService,
  ) {}

  async execute(hesId: string): Promise<Buffer> {
    const id = HESId.create(hesId);
    const hes = await this.repository.findById(id);

    if (!hes) {
      throw new NotFoundException(`HES no encontrada: ${hesId}`);
    }

    // Generar PDF
    return this.pdfGenerator.generate(hes);
  }
}
