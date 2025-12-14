/**
 * @repository PrismaEvidenciaRepository
 * @description Implementación de IEvidenciaRepository usando Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IEvidenciaRepository,
  EvidenciaFilters,
} from '../../domain/repositories/evidencia.repository.interface';
import { EvidenciaEntity, EvidenciaProps, TipoEvidencia } from '../../domain/entities/evidencia.entity';

@Injectable()
export class PrismaEvidenciaRepository implements IEvidenciaRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(filters: EvidenciaFilters): Promise<EvidenciaEntity[]> {
    const where = this.buildWhereClause(filters);

    const records = await this.prisma.evidenciaEjecucion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map(this.toDomainEntity);
  }

  async findById(id: string): Promise<EvidenciaEntity | null> {
    const record = await this.prisma.evidenciaEjecucion.findUnique({
      where: { id },
    });

    if (!record) return null;
    return this.toDomainEntity(record);
  }

  async create(evidencia: EvidenciaEntity): Promise<EvidenciaEntity> {
    const data = {
      id: evidencia.id,
      ejecucionId: evidencia.ejecucionId,
      ordenId: evidencia.ordenId,
      tipo: evidencia.tipo,
      nombreArchivo: evidencia.nombreArchivo,
      rutaArchivo: evidencia.rutaArchivo,
      tamano: evidencia.tamano,
      mimeType: evidencia.mimeType,
      descripcion: evidencia.descripcion,
      tags: evidencia.tags,
      subidoPor: evidencia.subidoPor,
      createdAt: evidencia.createdAt,
      updatedAt: evidencia.updatedAt,
    };

    const created = await this.prisma.evidenciaEjecucion.create({
      data,
    });

    return this.toDomainEntity(created);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evidenciaEjecucion.delete({ where: { id } });
  }

  async count(filters: EvidenciaFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.evidenciaEjecucion.count({ where });
  }

  // =====================================================
  // Private Methods
  // =====================================================

  private buildWhereClause(filters: EvidenciaFilters): any {
    const where: any = {};

    if (filters.ordenId) {
      where.ordenId = filters.ordenId;
    }

    if (filters.ejecucionId) {
      where.ejecucionId = filters.ejecucionId;
    }

    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    return where;
  }

  private toDomainEntity(record: any): EvidenciaEntity {
    const props: EvidenciaProps = {
      id: record.id,
      ejecucionId: record.ejecucionId,
      ordenId: record.ordenId,
      tipo: record.tipo as TipoEvidencia,
      nombreArchivo: record.nombreArchivo,
      rutaArchivo: record.rutaArchivo,
      tamano: record.tamano,
      mimeType: record.mimeType,
      descripcion: record.descripcion,
      tags: record.tags as string[],
      subidoPor: record.subidoPor,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return EvidenciaEntity.fromPersistence(props);
  }
}
