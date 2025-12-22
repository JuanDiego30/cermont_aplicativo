/**
 * @repository PrismaLineaVidaRepository
 * @description Implementación de repositorio de líneas de vida usando Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ILineaVidaRepository, CreateLineaVidaDto, InspeccionLineaVidaDto } from '../../application/dto';

@Injectable()
export class PrismaLineaVidaRepository implements ILineaVidaRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<any[]> {
        return this.prisma.inspeccionLineaVida.findMany({
            orderBy: { fechaInspeccion: 'desc' },
        });
    }

    async findById(id: string): Promise<any> {
        return this.prisma.inspeccionLineaVida.findUnique({
            where: { id },
            include: { componentes: true },
        });
    }

    async create(data: CreateLineaVidaDto, inspectorId: string): Promise<any> {
        return this.prisma.inspeccionLineaVida.create({
            data: {
                numeroLinea: data.ubicacion,
                fabricante: 'Desconocido',
                ubicacion: data.ubicacion,
                inspectorId,
                estado: 'pendiente' as any,
                observaciones: data.observaciones,
            },
        });
    }

    async findInspecciones(lineaVidaId: string): Promise<any[]> {
        return this.prisma.inspeccionLineaVida.findMany({
            where: { id: lineaVidaId },
            include: { componentes: true },
        });
    }

    async createInspeccion(data: InspeccionLineaVidaDto, inspectorId: string): Promise<any> {
        return this.prisma.inspeccionLineaVida.create({
            data: {
                numeroLinea: data.lineaVidaId,
                fabricante: 'Desconocido',
                ubicacion: 'Sin ubicación',
                inspectorId,
                estado: (data.aprobado ? 'conforme' : 'no_conforme') as any,
                observaciones: data.observaciones,
            },
        });
    }

    async updateFechaMantenimiento(id: string, fecha: string): Promise<any> {
        return this.prisma.inspeccionLineaVida.update({
            where: { id },
            data: { updatedAt: new Date(fecha) },
        });
    }

    async updateProximaInspeccion(id: string, fechaProxima: string): Promise<any> {
        return this.prisma.inspeccionLineaVida.update({
            where: { id },
            data: { updatedAt: new Date(fechaProxima) },
        });
    }
}
