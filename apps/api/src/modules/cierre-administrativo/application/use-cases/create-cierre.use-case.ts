/**
 * @useCase CreateCierreUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CIERRE_REPOSITORY, ICierreRepository, CreateCierreDto, CierreResponse } from '../dto';

@Injectable()
export class CreateCierreUseCase {
  constructor(
    @Inject(CIERRE_REPOSITORY)
    private readonly repo: ICierreRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateCierreDto, userId: string): Promise<{ message: string; data: CierreResponse }> {
    const cierre = await this.repo.create(dto, userId);

    this.eventEmitter.emit('cierre.creado', {
      cierreId: cierre.id,
      ordenId: dto.ordenId,
    });

    return {
      message: 'Cierre administrativo creado',
      data: {
        id: cierre.id,
        ordenId: cierre.ordenId,
        estado: cierre.estado,
        documentos: cierre.documentos?.map((d: any) => ({
          id: d.id,
          tipo: d.tipo,
          numero: d.numero,
          fechaDocumento: d.fechaDocumento?.toISOString(),
          estado: 'pendiente',
        })) || [],
        observaciones: cierre.observaciones,
        creadoPorId: cierre.creadoPorId,
        createdAt: cierre.createdAt.toISOString(),
      },
    };
  }
}
