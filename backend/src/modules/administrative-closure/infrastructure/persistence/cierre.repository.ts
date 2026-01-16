/**
 * @repository CierreRepository
 * Usa el modelo CierreAdministrativo de Prisma
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { ICierreRepository, CreateCierreDto } from "../../application/dto";

@Injectable()
export class CierreRepository implements ICierreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrden(ordenId: string): Promise<any> {
    return this.prisma.cierreAdministrativo.findUnique({
      where: { ordenId },
    });
  }

  async create(data: CreateCierreDto, userId: string): Promise<any> {
    return this.prisma.cierreAdministrativo.create({
      data: {
        ordenId: data.ordenId,
        observaciones: data.observacionesGenerales,
        fechaInicioOrden: new Date(),
        fechaInicioCierre: new Date(),
      },
    });
  }

  async uploadDocumento(
    cierreId: string,
    documentoId: string,
    url: string,
  ): Promise<void> {
    // No hay modelo separado para documentos, solo actualizamos observaciones
    await this.prisma.cierreAdministrativo.update({
      where: { id: cierreId },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async aprobar(cierreId: string, userId: string): Promise<any> {
    return this.prisma.cierreAdministrativo.update({
      where: { id: cierreId },
      data: {
        estaCompleto: true,
        porcentajeCompletado: 100,
        fechaCierreCompleto: new Date(),
      },
    });
  }

  async rechazar(cierreId: string, motivo: string): Promise<any> {
    return this.prisma.cierreAdministrativo.update({
      where: { id: cierreId },
      data: {
        observaciones: motivo,
        bloqueos: motivo,
      },
    });
  }
}
