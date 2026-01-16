/**
 * @repository PrismaEvidenciaRepository
 * @description Implementation of IEvidenciaRepository using Prisma
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IEvidenciaRepository, FindEvidenciasOptions } from '../../domain/repositories';
import { Evidencia } from '../../domain/entities';

@Injectable()
export class PrismaEvidenciaRepository implements IEvidenciaRepository {
  private readonly logger = new Logger(PrismaEvidenciaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(evidencia: Evidencia): Promise<Evidencia> {
    const data = evidencia.toPersistence() as Record<string, unknown>;
    const id = data.id as string;

    // Convert metadata to Prisma-compatible JSON
    const metadataJson = data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined;

    // Upsert pattern
    const saved = await this.prisma.evidenciaEjecucion.upsert({
      where: { id },
      create: {
        id,
        ejecucionId: data.ejecucionId as string,
        ordenId: data.ordenId as string,
        tipo: data.tipo as string,
        mimeType: data.mimeType as string,
        nombreArchivo: data.nombreArchivo as string,
        rutaArchivo: data.rutaArchivo as string,
        tamano: BigInt(data.tamano as number),
        thumbnailPath: (data.thumbnailPath as string) || null,
        status: (data.status as string) || 'READY',
        descripcion: data.descripcion as string,
        tags: data.tags as string[],
        metadata: metadataJson,
        subidoPor: data.subidoPor as string,
        verificada: (data.verificada as boolean) ?? false,
        verificadoPor: (data.verificadoPor as string) || null,
        verificadoEn: (data.verificadoEn as Date) || null,
        deletedAt: (data.deletedAt as Date) || null,
        deletedBy: (data.deletedBy as string) || null,
      },
      update: {
        thumbnailPath: (data.thumbnailPath as string) || null,
        status: (data.status as string) || 'READY',
        descripcion: data.descripcion as string,
        tags: data.tags as string[],
        metadata: metadataJson,
        verificada: (data.verificada as boolean) ?? undefined,
        verificadoPor: (data.verificadoPor as string) || null,
        verificadoEn: (data.verificadoEn as Date) || null,
        updatedAt: new Date(),
        deletedAt: (data.deletedAt as Date) || null,
        deletedBy: (data.deletedBy as string) || null,
      },
    });

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Evidencia | null> {
    const record = await this.prisma.evidenciaEjecucion.findUnique({
      where: { id },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findByIds(ids: string[]): Promise<Evidencia[]> {
    const records = await this.prisma.evidenciaEjecucion.findMany({
      where: { id: { in: ids } },
    });

    return records.map(r => this.toDomain(r));
  }

  async findMany(options: FindEvidenciasOptions): Promise<Evidencia[]> {
    const where = this.buildWhereClause(options);

    const records = await this.prisma.evidenciaEjecucion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: options.skip,
      take: options.take,
    });

    return records.map(r => this.toDomain(r));
  }

  async count(options: FindEvidenciasOptions): Promise<number> {
    const where = this.buildWhereClause(options);
    return this.prisma.evidenciaEjecucion.count({ where });
  }

  async existsByPath(path: string): Promise<boolean> {
    const count = await this.prisma.evidenciaEjecucion.count({
      where: { rutaArchivo: path },
    });
    return count > 0;
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.evidenciaEjecucion.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.evidenciaEjecucion.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });
  }

  async permanentDelete(id: string): Promise<void> {
    await this.prisma.evidenciaEjecucion.delete({
      where: { id },
    });
  }

  async findDeleted(ordenId?: string): Promise<Evidencia[]> {
    const records = await this.prisma.evidenciaEjecucion.findMany({
      where: {
        deletedAt: { not: null },
        ...(ordenId ? { ordenId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(r => this.toDomain(r));
  }

  // =====================================================
  // Private Methods
  // =====================================================

  private buildWhereClause(options: FindEvidenciasOptions): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (options.ordenId) {
      where.ordenId = options.ordenId;
    }

    if (options.ejecucionId) {
      where.ejecucionId = options.ejecucionId;
    }

    if (options.uploadedBy) {
      where.subidoPor = options.uploadedBy;
    }

    if (options.status) {
      where.status = options.status;
    }

    // By default, exclude deleted
    if (!options.includeDeleted) {
      where.deletedAt = null;
    }

    return where;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(record: any): Evidencia {
    return Evidencia.fromPersistence({
      id: record.id,
      ejecucionId: record.ejecucionId,
      ordenId: record.ordenId,
      tipo: record.tipo,
      mimeType: record.mimeType,
      nombreArchivo: record.nombreArchivo,
      rutaArchivo: record.rutaArchivo,
      tamano: Number(record.tamano), // Convert BigInt to number
      thumbnailPath: record.thumbnailPath ?? undefined,
      status: record.status ?? undefined,
      descripcion: record.descripcion,
      tags: record.tags,
      metadata: record.metadata as Record<string, unknown> | undefined,
      subidoPor: record.subidoPor,
      verificada: record.verificada ?? false,
      verificadoPor: record.verificadoPor ?? undefined,
      verificadoEn: record.verificadoEn ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt ?? undefined,
      deletedBy: record.deletedBy ?? undefined,
    });
  }
}
