/**
 * @repository EvidenciaRepository
 * Usa el modelo Evidence de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IEvidenciaRepository, EvidenciaData, CreateEvidenciaData } from '../../application/dto';

@Injectable()
export class EvidenciaRepository implements IEvidenciaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<EvidenciaData[]> {
    const evidencias = await this.prisma.evidence.findMany({
      where: { orderId: ordenId },
      orderBy: { createdAt: 'desc' },
    });
    return evidencias.map(this.toDomain);
  }

  async findById(id: string): Promise<EvidenciaData | null> {
    const evidencia = await this.prisma.evidence.findUnique({ where: { id } });
    return evidencia ? this.toDomain(evidencia) : null;
  }

  async create(data: CreateEvidenciaData): Promise<EvidenciaData> {
    const evidencia = await this.prisma.evidence.create({
      data: {
        orderId: data.ordenId,
        tipo: data.tipo,
        url: data.url,
        descripcion: data.descripcion || null,
      },
    });
    return this.toDomain(evidencia);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evidence.delete({ where: { id } });
  }

  async count(ordenId: string): Promise<number> {
    return this.prisma.evidence.count({ where: { orderId: ordenId } });
  }

  private toDomain(raw: any): EvidenciaData {
    return {
      id: raw.id,
      ordenId: raw.orderId,
      tipo: raw.tipo,
      url: raw.url,
      descripcion: raw.descripcion,
      latitud: null,
      longitud: null,
      creadoPorId: null,
      createdAt: raw.createdAt,
    };
  }
}
