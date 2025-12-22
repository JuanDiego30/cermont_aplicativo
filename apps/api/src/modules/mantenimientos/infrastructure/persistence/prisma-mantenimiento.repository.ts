/**
 * @repository PrismaMantenimientoRepository
 * @description Implementación de repositorio de mantenimientos usando Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    IMantenimientoRepository,
    MantenimientoQueryDto,
    CreateMantenimientoDto,
    EjecutarMantenimientoDto,
} from '../../application/dto';

@Injectable()
export class PrismaMantenimientoRepository implements IMantenimientoRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: MantenimientoQueryDto): Promise<any[]> {
        const where: any = {};
        if (filters.equipoId) where.equipoId = filters.equipoId;
        if (filters.tipo) where.tipo = filters.tipo;
        if (filters.estado) where.estado = filters.estado;
        if (filters.fechaDesde) where.fechaProgramada = { gte: new Date(filters.fechaDesde) };
        if (filters.fechaHasta) {
            where.fechaProgramada = { ...where.fechaProgramada, lte: new Date(filters.fechaHasta) };
        }

        return this.prisma.mantenimiento.findMany({
            where,
            orderBy: { fechaProgramada: 'desc' },
        });
    }

    async findById(id: string): Promise<any> {
        return this.prisma.mantenimiento.findUnique({
            where: { id },
        });
    }

    async findProximos(dias: number): Promise<any[]> {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + dias);

        return this.prisma.mantenimiento.findMany({
            where: {
                fechaProgramada: { lte: fechaLimite },
                estado: 'programado' as any,
            },
            orderBy: { fechaProgramada: 'asc' },
        });
    }

    async create(data: CreateMantenimientoDto): Promise<any> {
        return this.prisma.mantenimiento.create({
            data: {
                equipoId: data.equipoId,
                tipo: data.tipo as any,
                titulo: data.descripcion.substring(0, 100),
                descripcion: data.descripcion,
                fechaProgramada: new Date(data.fechaProgramada),
                prioridad: data.prioridad as any,
                estimacionHoras: data.duracionEstimada,
                tecnicoAsignadoId: data.tecnicoAsignadoId,
                estado: 'programado' as any,
            },
        });
    }

    async ejecutar(id: string, data: EjecutarMantenimientoDto, ejecutorId: string): Promise<any> {
        return this.prisma.mantenimiento.update({
            where: { id },
            data: {
                estado: 'completado' as any,
                horasReales: data.horasReales,
                notas: data.observaciones,
                fechaFin: new Date(),
            },
        });
    }

    async cancelar(id: string, motivo: string): Promise<any> {
        return this.prisma.mantenimiento.update({
            where: { id },
            data: {
                estado: 'cancelado' as any,
                notas: motivo,
            },
        });
    }
}
