/**
 * @mapper PreferenciaAlertaPrismaMapper
 *
 * Mapea entre Prisma Model y Domain Entity
 */

import { PreferenciaAlerta } from "../../domain/entities/preferencia-alerta.entity";

/**
 * Mapea desde Prisma a Domain Entity
 */
export class PreferenciaAlertaPrismaMapper {
  /**
   * Prisma Model → Domain Entity
   */
  public static toDomain(raw: any): PreferenciaAlerta {
    return PreferenciaAlerta.fromPersistence({
      id: raw.id,
      usuarioId: raw.usuarioId,
      tipoAlerta: raw.tipoAlerta,
      canalesPreferidos: raw.canalesPreferidos || ["EMAIL", "IN_APP"],
      noMolestar: raw.noMolestar || false,
      horariosPermitidos: raw.horariosPermitidos
        ? {
            inicio: raw.horariosPermitidos.inicio,
            fin: raw.horariosPermitidos.fin,
          }
        : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt || raw.createdAt,
    });
  }

  /**
   * Domain Entity → Prisma Model (para create/update)
   */
  public static toPersistence(preferencia: PreferenciaAlerta): any {
    const persistence = preferencia.toPersistence();

    return {
      id: persistence.id,
      usuarioId: persistence.usuarioId,
      tipoAlerta: persistence.tipoAlerta,
      canalesPreferidos: persistence.canalesPreferidos,
      noMolestar: persistence.noMolestar,
      horariosPermitidos: persistence.horariosPermitidos
        ? {
            inicio: persistence.horariosPermitidos.inicio,
            fin: persistence.horariosPermitidos.fin,
          }
        : null,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }
}
