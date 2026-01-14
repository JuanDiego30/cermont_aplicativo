import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Representa datos de sincronización pendiente
 * 'datos' es Record<string, unknown> porque su estructura varía según el 'tipo'
 */
export interface PendingSync {
  id: string;
  tipo: "EJECUCION" | "CHECKLIST" | "EVIDENCIA" | "TAREA" | "COSTO";
  operacion: "CREATE" | "UPDATE" | "DELETE";
  datos: Record<string, unknown>;
  timestamp: string;
  ordenId?: string;
  ejecucionId?: string;
}

export interface SyncResult {
  success: boolean;
  id: string;
  tipo: string;
  mensaje: string;
  nuevoId?: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // SINCRONIZACIÓN DE DATOS OFFLINE
  // =====================================================

  async syncPendingData(
    userId: string,
    pendingItems: PendingSync[],
  ): Promise<SyncResult[]> {
    this.logger.log(
      `Iniciando sincronización de ${pendingItems.length} items para usuario ${userId}`,
    );

    const resultados: SyncResult[] = [];

    // Ordenar por timestamp para procesar en orden cronológico
    const sortedItems = [...pendingItems].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (const item of sortedItems) {
      try {
        const resultado = await this.procesarItem(item, userId);
        resultados.push(resultado);
      } catch (error) {
        this.logger.error(`Error sincronizando item ${item.id}:`, error);
        resultados.push({
          success: false,
          id: item.id,
          tipo: item.tipo,
          mensaje: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    this.logger.log(
      `Sincronización completada: ${resultados.filter((r) => r.success).length}/${resultados.length} exitosos`,
    );

    return resultados;
  }

  private async procesarItem(
    item: PendingSync,
    userId: string,
  ): Promise<SyncResult> {
    switch (item.tipo) {
      case "EJECUCION":
        return this.syncEjecucion(item, userId);
      case "CHECKLIST":
        return this.syncChecklist(item, userId);
      case "EVIDENCIA":
        return this.syncEvidencia(item, userId);
      case "TAREA":
        return this.syncTarea(item, userId);
      case "COSTO":
        return this.syncCosto(item, userId);
      default:
        throw new BadRequestException(
          `Tipo de sincronización desconocido: ${item.tipo}`,
        );
    }
  }

  // Sincronizar ejecución
  private async syncEjecucion(
    item: PendingSync,
    userId: string,
  ): Promise<SyncResult> {
    const { operacion, datos, ordenId } = item;

    if (operacion === "UPDATE" && datos.ejecucionId) {
      await this.prisma.ejecucion.update({
        where: { id: datos.ejecucionId as string },
        data: {
          avancePercentaje: datos.avance as number,
          horasActuales: datos.horasActuales as number,
          observaciones: datos.observaciones as string | undefined,
          ubicacionGPS: datos.ubicacionGPS as any,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Ejecución actualizada",
        nuevoId: datos.ejecucionId as string,
      };
    }

    if (operacion === "CREATE" && ordenId) {
      const planeacion = await this.prisma.planeacion.findUnique({
        where: { ordenId },
      });

      if (!planeacion) {
        throw new BadRequestException("Orden no tiene planeación aprobada");
      }

      const ejecucion = await this.prisma.ejecucion.create({
        data: {
          ordenId,
          planeacionId: planeacion.id,
          estado: "en_progreso" as any,
          fechaInicio: new Date((datos.fechaInicio as string) || Date.now()),
          horasEstimadas: (datos.horasEstimadas as number) || 8,
          observacionesInicio: datos.observaciones as string,
          ubicacionGPS: datos.ubicacionGPS as any,
        },
      });

      await this.prisma.order.update({
        where: { id: ordenId },
        data: { estado: "ejecucion", fechaInicio: new Date() },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Ejecución creada",
        nuevoId: ejecucion.id,
      };
    }

    throw new BadRequestException("Operación de ejecución no válida");
  }

  // Sincronizar checklist
  private async syncChecklist(
    item: PendingSync,
    userId: string,
  ): Promise<SyncResult> {
    const { operacion, datos } = item;

    if (operacion === "UPDATE" && datos.checklistId) {
      await this.prisma.checklistEjecucion.update({
        where: { id: datos.checklistId as string },
        data: {
          completada: datos.completada as boolean,
          completadoPorId: datos.completada ? userId : null,
          completadoEn: datos.completada ? new Date() : null,
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Checklist actualizado",
        nuevoId: datos.checklistId as string,
      };
    }

    if (operacion === "CREATE" && datos.ejecucionId) {
      const checklist = await this.prisma.checklistEjecucion.create({
        data: {
          ejecucionId: datos.ejecucionId as string,
          nombre:
            (datos.nombre as string) ||
            (datos.item as string) ||
            "Checklist sin nombre",
          completada: (datos.completada as boolean) || false,
          completadoPorId: datos.completada ? userId : null,
          completadoEn: datos.completada ? new Date() : null,
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Checklist creado",
        nuevoId: checklist.id,
      };
    }

    throw new BadRequestException("Operación de checklist no válida");
  }

  // Sincronizar evidencia
  private async syncEvidencia(
    item: PendingSync,
    userId: string,
  ): Promise<SyncResult> {
    const { operacion, datos } = item;

    if (operacion === "CREATE" && datos.ejecucionId && datos.ordenId) {
      // La evidencia ya debe haber sido subida como archivo
      // Aquí solo registramos los metadatos
      const evidencia = await this.prisma.evidenciaEjecucion.create({
        data: {
          ejecucionId: datos.ejecucionId as string,
          ordenId: datos.ordenId as string,
          tipo: (datos.tipo as string) || "FOTO",
          nombreArchivo: datos.nombreArchivo as string,
          rutaArchivo: datos.rutaArchivo as string,
          tamano: (datos.tamano as number) || 0,
          mimeType: (datos.mimeType as string) || "image/jpeg",
          descripcion: (datos.descripcion as string) || "",
          ubicacionGPS: datos.ubicacionGPS as any,
          tags: (datos.tags as string[]) || [],
          subidoPor: userId,
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Evidencia registrada",
        nuevoId: evidencia.id,
      };
    }

    throw new BadRequestException("Operación de evidencia no válida");
  }

  // Sincronizar tarea
  private async syncTarea(
    item: PendingSync,
    userId: string,
  ): Promise<SyncResult> {
    const { operacion, datos } = item;

    if (operacion === "UPDATE" && datos.tareaId) {
      await this.prisma.tareaEjecucion.update({
        where: { id: datos.tareaId as string },
        data: {
          completada: datos.completada as boolean,
          horasReales: datos.horasReales as number | null,
          observaciones: datos.observaciones as string | null,
          completadaEn: datos.completada ? new Date() : null,
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Tarea actualizada",
        nuevoId: datos.tareaId as string,
      };
    }

    if (operacion === "CREATE" && datos.ejecucionId) {
      const tarea = await this.prisma.tareaEjecucion.create({
        data: {
          ejecucionId: datos.ejecucionId as string,
          descripcion: datos.descripcion as string,
          horasEstimadas: (datos.horasEstimadas as number) || 1,
          completada: (datos.completada as boolean) || false,
          horasReales: datos.horasReales as number | null,
          observaciones: datos.observaciones as string | null,
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Tarea creada",
        nuevoId: tarea.id,
      };
    }

    throw new BadRequestException("Operación de tarea no válida");
  }

  // Sincronizar costo
  private async syncCosto(
    item: PendingSync,
    userId: string,
  ): Promise<SyncResult> {
    const { operacion, datos } = item;

    if (operacion === "CREATE" && datos.ordenId) {
      const costo = await this.prisma.cost.create({
        data: {
          orderId: datos.ordenId as string,
          concepto: datos.concepto as string,
          monto: datos.monto as number,
          tipo: datos.tipo as any,
          descripcion: datos.descripcion as string | undefined,
        },
      });

      return {
        success: true,
        id: item.id,
        tipo: item.tipo,
        mensaje: "Costo registrado",
        nuevoId: costo.id,
      };
    }

    throw new BadRequestException("Operación de costo no válida");
  }

  // =====================================================
  // VERIFICACIÓN DE ESTADO DE SYNC
  // =====================================================

  async getLastSyncStatus(userId: string) {
    // Obtener las últimas modificaciones del usuario
    const ultimaEjecucion = await this.prisma.ejecucion.findFirst({
      where: { orden: { asignadoId: userId } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, updatedAt: true },
    });

    const ultimaEvidencia = await this.prisma.evidenciaEjecucion.findFirst({
      where: { subidoPor: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    return {
      ultimaSincronizacion: new Date(),
      ultimaEjecucion: ultimaEjecucion?.updatedAt,
      ultimaEvidencia: ultimaEvidencia?.createdAt,
      mensaje: "Datos sincronizados correctamente",
    };
  }

  // Obtener órdenes para trabajo offline
  async getOrdenesParaOffline(userId: string) {
    const ordenes = await this.prisma.order.findMany({
      where: {
        asignadoId: userId,
        estado: { in: ["planeacion", "ejecucion"] },
      },
      include: {
        planeacion: {
          include: {
            items: true,
            kit: true,
          },
        },
        ejecucion: {
          include: {
            checklists: true,
            tareas: true,
          },
        },
      },
    });

    return {
      fechaDescarga: new Date().toISOString(),
      ordenes: ordenes.map((o) => ({
        id: o.id,
        numero: o.numero,
        cliente: o.cliente,
        descripcion: o.descripcion,
        estado: o.estado,
        prioridad: o.prioridad,
        planeacion: o.planeacion,
        ejecucion: o.ejecucion,
      })),
    };
  }
}
