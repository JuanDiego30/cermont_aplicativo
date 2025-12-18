
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../../common/base/base.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Mantenimiento } from '../../domain/entities/mantenimiento.entity';

@Injectable()
export class MantenimientosRepository extends BaseRepository<Mantenimiento> {
  protected get model(): any {
    return this.prisma['mantenimiento'];
  }

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Métodos específicos si se requieren (e.g. buscar por equipo, técnico, etc)
  async findByEquipo(equipoId: string): Promise<Mantenimiento[]> {
    const items = await this.prisma.mantenimiento.findMany({
      where: { equipoId },
    });
    return items.map(item => new Mantenimiento(item as unknown as Partial<Mantenimiento>));
  }
}
