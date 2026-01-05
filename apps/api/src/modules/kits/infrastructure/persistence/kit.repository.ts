/**
 * @repository KitRepository
 * Usa el modelo KitTipico de Prisma
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { CreateKitDto } from "../../application/dto";

// Legacy types
type KitData = any;
interface IKitRepository {
  findAll(): Promise<KitData[]>;
  findById(id: string): Promise<KitData | null>;
  findByCategoria(categoria: string): Promise<KitData[]>;
  create(data: CreateKitDto): Promise<KitData>;
  update(id: string, data: Partial<CreateKitDto>): Promise<KitData>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class KitRepository implements IKitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<KitData[]> {
    const kits = await this.prisma.kitTipico.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
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
        nombre: { contains: categoria, mode: "insensitive" },
      },
      orderBy: { nombre: "asc" },
    });

    return kits.map(this.mapToKitData);
  }

  async create(data: CreateKitDto): Promise<KitData> {
    const kit = await this.prisma.kitTipico.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        herramientas: (data.herramientas || data.items || []) as any,
        equipos: (data.equipos || []) as any,
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

  async update(id: string, data: Partial<CreateKitDto>): Promise<KitData> {
    const updateData: any = {};
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined)
      updateData.descripcion = data.descripcion;
    if (data.herramientas) updateData.herramientas = data.herramientas;
    if (data.equipos) updateData.equipos = data.equipos;
    if (data.documentos) updateData.documentos = data.documentos;
    if (data.checklistItems) updateData.checklistItems = data.checklistItems;
    if (data.duracionEstimadaHoras !== undefined)
      updateData.duracionEstimadaHoras = data.duracionEstimadaHoras;
    if (data.costoEstimado !== undefined)
      updateData.costoEstimado = data.costoEstimado;

    const kit = await this.prisma.kitTipico.update({
      where: { id },
      data: updateData,
    });

    return this.mapToKitData(kit);
  }

  async changeEstado(id: string, activo: boolean): Promise<KitData> {
    const kit = await this.prisma.kitTipico.update({
      where: { id },
      data: { activo },
    });

    return this.mapToKitData(kit);
  }

  async applyKitToExecution(kitId: string, ejecucionId: string): Promise<any> {
    // Este método requiere lógica compleja, se mantiene en el servicio por ahora
    throw new Error(
      "Método applyKitToExecution debe implementarse en el servicio",
    );
  }

  async syncPredefinedKits(): Promise<any[]> {
    // Este método requiere lógica compleja, se mantiene en el servicio por ahora
    throw new Error(
      "Método syncPredefinedKits debe implementarse en el servicio",
    );
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
