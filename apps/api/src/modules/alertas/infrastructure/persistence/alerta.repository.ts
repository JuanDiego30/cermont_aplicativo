/**
 * @repository AlertaRepository
 *
 * Implementación del repositorio de alertas usando Prisma
 */

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  IAlertaRepository,
  HistorialQuery,
  PaginatedResult,
} from "../../domain/repositories/alerta.repository.interface";
import { Alerta } from "../../domain/entities/alerta.entity";
import { AlertaPrismaMapper } from "./alerta.prisma.mapper";
import { EstadoAlertaEnum } from "../../domain/value-objects/estado-alerta.vo";

@Injectable()
export class AlertaRepository implements IAlertaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(alerta: Alerta): Promise<Alerta> {
    const persistence = AlertaPrismaMapper.toPersistence(alerta);

    const result = await this.prisma.alertaAutomatica.upsert({
      where: { id: persistence.id },
      create: {
        id: persistence.id,
        tipo: persistence.tipo as any,
        prioridad: persistence.prioridad as any,
        titulo: persistence.titulo,
        mensaje: persistence.mensaje,
        usuarioId: persistence.usuarioId,
        ordenId: persistence.ordenId,
        metadata: persistence.metadata,
        resuelta: persistence.resuelta,
        leida: persistence.leida,
        leidaAt: persistence.leidaAt,
        createdAt: persistence.createdAt,
      },
      update: {
        metadata: persistence.metadata,
        resuelta: persistence.resuelta,
        leida: persistence.leida,
        leidaAt: persistence.leidaAt,
      },
    });

    return AlertaPrismaMapper.toDomain(result);
  }

  async findById(id: string): Promise<Alerta | null> {
    const result = await this.prisma.alertaAutomatica.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    return AlertaPrismaMapper.toDomain(result);
  }

  async findPendientesByUsuario(usuarioId: string): Promise<Alerta[]> {
    const results = await this.prisma.alertaAutomatica.findMany({
      where: {
        usuarioId,
        resuelta: false,
        leida: false,
      },
      orderBy: [{ prioridad: "desc" }, { createdAt: "desc" }],
    });

    return results.map((r) => AlertaPrismaMapper.toDomain(r));
  }

  async findHistorial(query: HistorialQuery): Promise<PaginatedResult<Alerta>> {
    const skip = (query.page - 1) * query.limit;

    const where: any = {
      usuarioId: query.usuarioId,
    };

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.estado) {
      // Mapear estado de dominio a campos de Prisma
      if (query.estado === EstadoAlertaEnum.LEIDA) {
        where.resuelta = true;
      } else if (query.estado === EstadoAlertaEnum.ENVIADA) {
        where.leida = true;
        where.resuelta = false;
      } else if (query.estado === EstadoAlertaEnum.PENDIENTE) {
        where.leida = false;
        where.resuelta = false;
      }
    }

    if (query.prioridad) {
      where.prioridad = query.prioridad;
    }

    if (query.soloNoLeidas) {
      where.leida = false;
      where.resuelta = false;
    }

    const [items, total] = await Promise.all([
      this.prisma.alertaAutomatica.findMany({
        where,
        orderBy: [{ prioridad: "desc" }, { createdAt: "desc" }],
        skip,
        take: query.limit,
      }),
      this.prisma.alertaAutomatica.count({ where }),
    ]);

    return {
      items: items.map((i) => AlertaPrismaMapper.toDomain(i)),
      total,
    };
  }

  async findFallidasParaReintentar(): Promise<Alerta[]> {
    const results = await this.prisma.alertaAutomatica.findMany({
      where: {
        resuelta: false,
        leida: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const alertas = results.map((r) => AlertaPrismaMapper.toDomain(r));
    return alertas.filter((a) => a.getIntentosEnvio() < 3);
  }

  async marcarComoEnviada(id: string, canal: string): Promise<void> {
    const alerta = await this.prisma.alertaAutomatica.findUnique({
      where: { id },
    });

    if (!alerta) {
      return;
    }

    const metadata = (alerta.metadata as Record<string, any>) || {};
    metadata.enviadaAt = new Date().toISOString();
    metadata.canalEnviado = canal;

    await this.prisma.alertaAutomatica.update({
      where: { id },
      data: {
        leida: true,
        metadata,
      },
    });
  }

  async marcarComoLeida(id: string): Promise<void> {
    await this.prisma.alertaAutomatica.update({
      where: { id },
      data: {
        leida: true,
        leidaAt: new Date(),
        resuelta: true,
        resueltaAt: new Date(),
      },
    });
  }

  async findExistentAlerta(
    ordenId: string,
    tipo: string,
  ): Promise<Alerta | null> {
    const result = await this.prisma.alertaAutomatica.findFirst({
      where: {
        ordenId,
        tipo: tipo as any,
        resuelta: false,
      },
    });

    if (!result) {
      return null;
    }

    return AlertaPrismaMapper.toDomain(result);
  }

  async countNoLeidasByUsuario(usuarioId: string): Promise<number> {
    return this.prisma.alertaAutomatica.count({
      where: {
        usuarioId,
        leida: false,
        resuelta: false,
      },
    });
  }
}
