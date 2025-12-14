/**
 * @repository KitRepository
 * Usa el modelo KitTipico de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateKitDto, KitData, IKitRepository } from '../../application/dto';

@Injectable()
export class KitRepository implements IKitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<KitData[]> {
    const kits = await this.prisma.kitTipico.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    return kits.map(this.mapToKitData);
  }

  async findById(id: string): Promise<KitData | null> {
    const kit = await this.prisma.kitTipico.findUnique({
      where: { id },
    });

    return kit ? this.mapToKitData(kit) : null;
  }

  async findByCategoria(categoria: string): Promise<KitData[]> {
    const kits = await this.prisma.kitTipico.findMany({
      where: {
        activo: true,
        nombre: { contains: categoria, mode: 'insensitive' },
      },
      orderBy: { nombre: 'asc' },
    });

    return kits.map(this.mapToKitData);
  }

  async create(data: CreateKitDto): Promise<KitData> {
    const kit = await this.prisma.kitTipico.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        herramientas: data.herramientas || data.items || [],
        equipos: data.equipos || [],
        documentos: data.documentos || [],
        checklistItems: data.checklistItems || [],
        duracionEstimadaHoras: data.duracionEstimadaHoras || 0,
        costoEstimado: data.costoEstimado || 0,
        activo: true,
      },
    });

    return this.mapToKitData(kit);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kitTipico.update({
      where: { id },
      data: { activo: false },
    });
  }

  private mapToKitData(kit: any): KitData {
    return {
      id: kit.id,
      nombre: kit.nombre,
      descripcion: kit.descripcion,
      herramientas: kit.herramientas,
      equipos: kit.equipos,
      documentos: kit.documentos,
      checklistItems: kit.checklistItems,
      duracionEstimadaHoras: kit.duracionEstimadaHoras,
      costoEstimado: kit.costoEstimado,
      activo: kit.activo,
      createdAt: kit.createdAt,
      updatedAt: kit.updatedAt,
    };
  }
}
