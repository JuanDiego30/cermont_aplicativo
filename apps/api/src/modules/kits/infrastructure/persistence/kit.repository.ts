/**
 * @repository KitRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IKitRepository, KitData, CreateKitDto } from '../../application/dto';

@Injectable()
export class KitRepository implements IKitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<KitData[]> {
    const kits = await this.prisma.kit.findMany({
      include: { items: true },
    });
    return kits.map(this.toDomain);
  }

  async findById(id: string): Promise<KitData | null> {
    const kit = await this.prisma.kit.findUnique({
      where: { id },
      include: { items: true },
    });
    return kit ? this.toDomain(kit) : null;
  }

  async findByCategoria(categoria: string): Promise<KitData[]> {
    const kits = await this.prisma.kit.findMany({
      where: { categoria },
      include: { items: true },
    });
    return kits.map(this.toDomain);
  }

  async create(data: CreateKitDto): Promise<KitData> {
    const kit = await this.prisma.kit.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        items: {
          create: data.items.map((item) => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            unidad: item.unidad,
          })),
        },
      },
      include: { items: true },
    });
    return this.toDomain(kit);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kit.delete({ where: { id } });
  }

  private toDomain(raw: any): KitData {
    return {
      id: raw.id,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      categoria: raw.categoria,
      items: raw.items.map((i: any) => ({
        id: i.id,
        nombre: i.nombre,
        cantidad: i.cantidad,
        unidad: i.unidad,
      })),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
