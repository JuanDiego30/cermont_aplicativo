/**
 * Repository Implementation: KitRepository
 *
 * Prisma implementation of IKitRepository
 */
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IKitRepository } from "../../domain/repositories";
import { Kit } from "../../domain/entities";
import { KitId } from "../../domain/value-objects/kit-id.vo";
import { CategoriaKit } from "../../domain/value-objects/categoria-kit.vo";
import { EstadoKit } from "../../domain/value-objects/estado-kit.vo";
import { KitMapper } from "../../application/mappers";

@Injectable()
export class KitRepositoryImpl implements IKitRepository {
  private readonly logger = new Logger(KitRepositoryImpl.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(kit: Kit): Promise<Kit> {
    const data = KitMapper.toPrisma(kit);

    const saved = await this.prisma.kitTipico.upsert({
      where: { id: data["id"] as string },
      create: {
        id: data["id"] as string,
        nombre: data["nombre"] as string,
        descripcion: (data["descripcion"] as string | undefined) ?? "",
        herramientas: data["herramientas"] as object,
        equipos: data["equipos"] as object,
        documentos: data["documentos"] as string[],
        checklistItems: data["checklistItems"] as string[],
        duracionEstimadaHoras: data["duracionEstimadaHoras"] as number,
        costoEstimado: data["costoEstimado"] as number,
        activo: data["activo"] as boolean,
      },
      update: {
        nombre: data["nombre"] as string,
        descripcion: (data["descripcion"] as string | undefined) ?? "",
        herramientas: data["herramientas"] as object,
        equipos: data["equipos"] as object,
        documentos: data["documentos"] as string[],
        checklistItems: data["checklistItems"] as string[],
        duracionEstimadaHoras: data["duracionEstimadaHoras"] as number,
        costoEstimado: data["costoEstimado"] as number,
        activo: data["activo"] as boolean,
        updatedAt: new Date(),
      },
    });

    return KitMapper.fromPrisma(saved as unknown as Record<string, unknown>);
  }

  async findById(id: KitId): Promise<Kit | null> {
    const kit = await this.prisma.kitTipico.findUnique({
      where: { id: id.getValue() },
    });

    if (!kit) return null;

    return KitMapper.fromPrisma(kit as unknown as Record<string, unknown>);
  }

  async findByCodigo(codigo: string): Promise<Kit | null> {
    // KitTipico doesn't have codigo field, search by nombre pattern
    const kit = await this.prisma.kitTipico.findFirst({
      where: { nombre: { contains: codigo } },
    });

    if (!kit) return null;

    return KitMapper.fromPrisma(kit as unknown as Record<string, unknown>);
  }

  async findByCategoria(categoria: CategoriaKit): Promise<Kit[]> {
    // Filter by nombre pattern since we don't have categoria field
    const kits = await this.prisma.kitTipico.findMany({
      where: {
        activo: true,
        nombre: { contains: categoria.getValue() },
      },
      orderBy: { createdAt: "desc" },
    });

    return kits.map((k) =>
      KitMapper.fromPrisma(k as unknown as Record<string, unknown>),
    );
  }

  async findAllActive(): Promise<Kit[]> {
    const kits = await this.prisma.kitTipico.findMany({
      where: { activo: true },
      orderBy: { createdAt: "desc" },
    });

    return kits.map((k) =>
      KitMapper.fromPrisma(k as unknown as Record<string, unknown>),
    );
  }

  async findByEstado(estado: EstadoKit): Promise<Kit[]> {
    const activo = estado.esActivo() || estado.esEnUso();

    const kits = await this.prisma.kitTipico.findMany({
      where: { activo },
      orderBy: { createdAt: "desc" },
    });

    return kits.map((k) =>
      KitMapper.fromPrisma(k as unknown as Record<string, unknown>),
    );
  }

  async findTemplates(): Promise<Kit[]> {
    // Templates are kits that look like templates (have herramientas defined)
    const kits = await this.prisma.kitTipico.findMany({
      where: {
        activo: true,
        herramientas: { not: { equals: [] } },
      },
      orderBy: { createdAt: "desc" },
    });

    return kits.map((k) =>
      KitMapper.fromPrisma(k as unknown as Record<string, unknown>),
    );
  }

  async existsByCodigo(codigo: string): Promise<boolean> {
    const count = await this.prisma.kitTipico.count({
      where: { nombre: { contains: codigo } },
    });

    return count > 0;
  }

  async getNextSequence(categoriaPrefix: string): Promise<number> {
    const count = await this.prisma.kitTipico.count();
    return count + 1;
  }

  async delete(id: KitId): Promise<void> {
    await this.prisma.kitTipico.update({
      where: { id: id.getValue() },
      data: { activo: false },
    });
  }

  async countByCategoria(categoria: CategoriaKit): Promise<number> {
    return this.prisma.kitTipico.count({
      where: {
        activo: true,
        nombre: { contains: categoria.getValue() },
      },
    });
  }
}
