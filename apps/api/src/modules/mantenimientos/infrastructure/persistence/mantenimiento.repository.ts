/**
 * @repository MantenimientoRepository
 * Usa el modelo Mantenimiento de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateMantenimientoDto,
  EjecutarMantenimientoDto,
  MantenimientoQueryDto,
  IMantenimientoRepository,
} from '../../application/dto';

// Mapeo de tipos DTO a enums Prisma
const tipoMap: Record<string, 'PREVENTIVO' | 'CORRECTIVO' | 'PREDICTIVO'> = {
  preventivo: 'PREVENTIVO',
  correctivo: 'CORRECTIVO',
  predictivo: 'PREDICTIVO',
  programado: 'PREVENTIVO',
};

const estadoMap: Record<string, 'PROGRAMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO'> = {
  programado: 'PROGRAMADO',
  en_ejecucion: 'EN_PROGRESO',
  completado: 'COMPLETADO',
  cancelado: 'CANCELADO',
};

const prioridadMap: Record<string, 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'> = {
  baja: 'BAJA',
  media: 'MEDIA',
  alta: 'ALTA',
  critica: 'CRITICA',
};

@Injectable()
export class MantenimientoRepository implements IMantenimientoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: MantenimientoQueryDto): Promise<any[]> {
    const where: any = {};
    if (filters.equipoId) where.equipoId = filters.equipoId;
    if (filters.tipo) where.tipo = tipoMap[filters.tipo];
    if (filters.estado) where.estado = estadoMap[filters.estado];
    if (filters.fechaDesde) where.fechaProgramada = { gte: new Date(filters.fechaDesde) };
    if (filters.fechaHasta) {
      where.fechaProgramada = { ...where.fechaProgramada, lte: new Date(filters.fechaHasta) };
    }

    return this.prisma.mantenimiento.findMany({
      where,
      orderBy: { fechaProgramada: 'asc' },
      include: { equipo: true, tecnicoAsignado: true },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.mantenimiento.findUnique({
      where: { id },
      include: { equipo: true, tecnicoAsignado: true },
    });
  }

  async findProximos(dias: number): Promise<any[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    return this.prisma.mantenimiento.findMany({
      where: {
        estado: 'PROGRAMADO',
        fechaProgramada: {
          gte: new Date(),
          lte: fechaLimite,
        },
      },
      orderBy: { fechaProgramada: 'asc' },
      include: { equipo: true, tecnicoAsignado: true },
    });
  }

  async create(data: CreateMantenimientoDto): Promise<any> {
    return this.prisma.mantenimiento.create({
      data: {
        equipoId: data.equipoId,
        tipo: tipoMap[data.tipo],
        descripcion: data.descripcion,
        titulo: data.descripcion.substring(0, 50),
        fechaProgramada: new Date(data.fechaProgramada),
        prioridad: prioridadMap[data.prioridad],
        estimacionHoras: data.duracionEstimada,
        tecnicoAsignadoId: data.tecnicoAsignadoId,
        estado: 'PROGRAMADO',
        notas: data.materialesRequeridos?.join(', '),
      },
      include: { equipo: true, tecnicoAsignado: true },
    });
  }

  async ejecutar(id: string, data: EjecutarMantenimientoDto, ejecutorId: string): Promise<any> {
    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        estado: 'COMPLETADO',
        fechaInicio: new Date(),
        fechaFin: new Date(),
        horasReales: data.horasReales,
        observaciones: data.observaciones,
        repuestosUtilizados: data.materialesUtilizados?.join(', '),
        costoTotal: (data.costoMateriales || 0) + (data.costoManoObra || 0),
        actualizadoPorId: ejecutorId,
      },
      include: { equipo: true, tecnicoAsignado: true },
    });
  }

  async cancelar(id: string, motivo: string): Promise<any> {
    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        estado: 'CANCELADO',
        observaciones: motivo,
      },
    });
  }
}
