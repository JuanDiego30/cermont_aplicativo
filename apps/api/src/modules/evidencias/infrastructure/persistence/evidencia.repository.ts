/**
 * @repository EvidenciaRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IEvidenciaRepository, EvidenciaData, CreateEvidenciaData } from '../../domain/repositories';

@Injectable()
export class EvidenciaRepository implements IEvidenciaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<EvidenciaData[]> {
    const evidencias = await this.prisma.evidencia.findMany({
      where: { ordenId },
      orderBy: { createdAt: 'desc' },
    });
    return evidencias.map(this.toDomain);
  }

  async findById(id: string): Promise<EvidenciaData | null> {
    const evidencia = await this.prisma.evidencia.findUnique({ where: { id } });
    return evidencia ? this.toDomain(evidencia) : null;
  }

  async create(data: CreateEvidenciaData): Promise<EvidenciaData> {
    const evidencia = await this.prisma.evidencia.create({ data });
    return this.toDomain(evidencia);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evidencia.delete({ where: { id } });
  }

  async count(ordenId: string): Promise<number> {
    return this.prisma.evidencia.count({ where: { ordenId } });
  }

  private toDomain(raw: any): EvidenciaData {
    return {
      id: raw.id,
      ordenId: raw.ordenId,
      tipo: raw.tipo,
      url: raw.url,
      descripcion: raw.descripcion,
      latitud: raw.latitud,
      longitud: raw.longitud,
      creadoPorId: raw.creadoPorId,
      createdAt: raw.createdAt,
    };
  }
}
