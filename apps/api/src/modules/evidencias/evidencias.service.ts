import { Express } from 'express';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class EvidenciasService {
    constructor(private readonly prisma: PrismaService) { }

    async findByOrden(ordenId: string) { const evidencias = await this.prisma.evidenciaEjecucion.findMany({ where: { ordenId }, orderBy: { createdAt: 'desc' } }); return { data: evidencias }; }
    async findByEjecucion(ejecucionId: string) { const evidencias = await this.prisma.evidenciaEjecucion.findMany({ where: { ejecucionId }, orderBy: { createdAt: 'desc' } }); return { data: evidencias }; }
    async upload(file: Express.Multer.File, dto: any, userId: string) {
        const evidencia = await this.prisma.evidenciaEjecucion.create({ data: { ejecucionId: dto.ejecucionId, ordenId: dto.ordenId, tipo: dto.tipo || 'FOTO', nombreArchivo: file.originalname, rutaArchivo: file.path, tamano: file.size, mimeType: file.mimetype, descripcion: dto.descripcion || '', subidoPor: userId, tags: dto.tags ? dto.tags.split(',') : [] } });
        return { message: 'Evidencia subida', data: evidencia };
    }
    async remove(id: string) {
        const evidencia = await this.prisma.evidenciaEjecucion.findUnique({ where: { id } });
        if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
        if (fs.existsSync(evidencia.rutaArchivo)) fs.unlinkSync(evidencia.rutaArchivo);
        await this.prisma.evidenciaEjecucion.delete({ where: { id } });
        return { message: 'Evidencia eliminada' };
    }
}

