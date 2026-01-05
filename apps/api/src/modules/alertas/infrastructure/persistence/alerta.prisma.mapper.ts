/**
 * @mapper AlertaPrismaMapper
 *
 * Mapea entre Prisma Model y Domain Entity
 */

import { Alerta } from "../../domain/entities/alerta.entity";
import { EstadoAlerta } from "../../domain/value-objects/estado-alerta.vo";

/**
 * Mapea desde Prisma a Domain Entity
 */
export class AlertaPrismaMapper {
  /**
   * Prisma Model → Domain Entity
   */
  public static toDomain(raw: any): Alerta {
    // Mapear estado desde campos de Prisma
    let estado = "PENDIENTE";
    if (raw.resuelta) {
      estado = "LEIDA"; // Si está resuelta, considerarla leída
    } else if (raw.leida) {
      estado = "ENVIADA"; // Si está leída, fue enviada
    } else {
      estado = "PENDIENTE";
    }

    // Mapear metadata (incluye canales, estado, intentosEnvio si están en metadata)
    const metadata: Record<string, any> =
      (raw.metadata as Record<string, any>) || {};
    if (raw.ordenId) {
      metadata.ordenId = raw.ordenId;
    }

    // Extraer campos del dominio desde metadata si existen
    const canalesFromMeta = metadata.canales;
    const intentosFromMeta = metadata.intentosEnvio;

    // Mapear canales desde metadata o usar defaults
    const canales = canalesFromMeta || ["EMAIL", "IN_APP"];

    return Alerta.fromPersistence({
      id: raw.id,
      tipo: raw.tipo,
      prioridad: raw.prioridad,
      titulo: raw.titulo,
      mensaje: raw.mensaje,
      destinatarioId: raw.usuarioId || raw.destinatarioId || "",
      canales,
      estado,
      intentosEnvio: intentosFromMeta || 0,
      enviadaEn: metadata.enviadaAt ? new Date(metadata.enviadaAt) : undefined,
      leidaEn: raw.leidaAt || raw.leidaEn,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || raw.createdAt,
    });
  }

  /**
   * Domain Entity → Prisma Model (para create/update)
   */
  public static toPersistence(alerta: Alerta): any {
    const persistence = alerta.toPersistence();

    // Mapear estado a campos de Prisma
    const estado = alerta.getEstado();
    const resuelta = estado.isLeida();
    const leida = estado.isEnviada() || estado.isLeida();

    return {
      id: persistence.id,
      tipo: persistence.tipo,
      prioridad: persistence.prioridad,
      titulo: persistence.titulo,
      mensaje: persistence.mensaje,
      usuarioId: persistence.destinatarioId,
      ordenId: persistence.metadata?.ordenId,
      // Nota: canales, estado, intentosEnvio no existen en schema actual
      // Se guardarán en metadata hasta que se cree migración
      metadata: {
        ...persistence.metadata,
        canales: persistence.canales,
        estado: persistence.estado,
        intentosEnvio: persistence.intentosEnvio,
      },
      resuelta,
      leida,
      leidaAt: persistence.leidaEn,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }
}
