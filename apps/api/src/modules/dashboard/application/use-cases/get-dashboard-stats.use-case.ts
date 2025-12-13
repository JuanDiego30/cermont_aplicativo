/**
 * @useCase GetDashboardStatsUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository,
  DashboardQueryDto,
  DashboardResponse,
} from '../dto';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repo: IDashboardRepository,
  ) {}

  async execute(filters?: DashboardQueryDto): Promise<DashboardResponse> {
    const [stats, tendencia, ultimasOrdenes] = await Promise.all([
      this.repo.getStats(filters),
      this.repo.getTendencia(30),
      this.repo.getUltimasOrdenes(10),
    ]);

    return {
      stats,
      tendencia,
      ultimasOrdenes: ultimasOrdenes.map((o) => ({
        id: o.id,
        numero: o.numero,
        estado: o.estado,
        prioridad: o.prioridad,
        fechaCreacion: o.createdAt.toISOString(),
      })),
    };
  }
}
