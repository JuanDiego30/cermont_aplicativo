/**
 * @useCase ListFormulariosUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { FORMULARIO_REPOSITORY, IFormularioRepository, FormularioResponse } from '../dto';

@Injectable()
export class ListFormulariosUseCase {
  constructor(
    @Inject(FORMULARIO_REPOSITORY)
    private readonly repo: IFormularioRepository,
  ) {}

  async execute(categoria?: string): Promise<FormularioResponse[]> {
    const formularios = categoria
      ? await this.repo.findByCategoria(categoria)
      : await this.repo.findAll();

    return formularios.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      descripcion: f.descripcion,
      categoria: f.categoria,
      campos: f.campos,
      createdAt: f.createdAt.toISOString(),
    }));
  }
}
