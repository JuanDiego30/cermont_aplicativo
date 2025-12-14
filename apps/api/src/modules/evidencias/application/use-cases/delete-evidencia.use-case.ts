/**
 * @useCase DeleteEvidenciaUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from '../../domain/repositories/evidencia.repository.interface';
import * as fs from 'fs';

@Injectable()
export class DeleteEvidenciaUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly evidenciaRepository: IEvidenciaRepository,
  ) { }

  async execute(id: string): Promise<void> {
    const evidencia = await this.evidenciaRepository.findById(id);

    if (!evidencia) {
      throw new NotFoundException('Evidencia no encontrada');
    }

    // Borrar archivo (Infrastructure concern leaked here for simplicity, 
    // ideally inject IFileStorageService)
    try {
      if (fs.existsSync(evidencia.rutaArchivo)) {
        fs.unlinkSync(evidencia.rutaArchivo);
      }
    } catch (e) {
      console.error('Error deleting file:', e);
    }

    await this.evidenciaRepository.delete(id);
  }
}
