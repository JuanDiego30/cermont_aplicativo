/**
 * @repository EjecucionRepository
 * Implements the new IEjecucionRepository interface while maintaining backward compatibility.
 */
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  IEjecucionRepository,
  EJECUCION_REPOSITORY,
} from "../../domain/repositories/ejecucion.repository.interface";
import {
  Ejecucion,
  EjecucionProps,
} from "../../domain/entities/ejecucion.entity";
import { TimeLog, TimeLogProps } from "../../domain/entities/time-log.entity";
import {
  ActivityLog,
  ActivityLogProps,
} from "../../domain/entities/activity-log.entity";
import { Evidence, EvidenceProps } from "../../domain/entities/evidence.entity";
import { EjecucionId } from "../../domain/value-objects/ejecucion-id.vo";
import {
  ExecutionStatus,
  ExecutionStatusEnum,
} from "../../domain/value-objects/execution-status.vo";
import { ProgressPercentage } from "../../domain/value-objects/progress-percentage.vo";
import { GeoLocation } from "../../domain/value-objects/geo-location.vo";
import { EvidenceTypeEnum } from "../../domain/value-objects/evidence-type.vo";

@Injectable()
export class EjecucionRepository implements IEjecucionRepository {
  private readonly logger = new Logger(EjecucionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(ejecucion: Ejecucion): Promise<Ejecucion> {
    const data = ejecucion.toPersistence();

    const saved = await this.prisma.ejecucion.upsert({
      where: { id: data["id"] as string },
      update: {
        estado: data["estado"] as any, // Cast to any to avoid enum mismatch, let Prisma validate
        avancePercentaje: data["avancePercentaje"] as number,
        horasActuales: data["horasActuales"] as number,
        ubicacionGPS: (data["ubicacionGPS"] || null) as any,
        observacionesInicio: data["observacionesInicio"] as string | null,
        observaciones: data["observaciones"] as string | null,
        iniciadoPorId: data["iniciadoPorId"] as string | null,
        finalizadoPorId: data["finalizadoPorId"] as string | null,
        fechaInicio: data["fechaInicio"] as Date,
        fechaTermino: data["fechaTermino"] as Date | null,
      },
      create: {
        id: data["id"] as string,
        ordenId: data["ordenId"] as string,
        planeacionId: data["planeacionId"] as string,
        estado: data["estado"] as any,
        avancePercentaje: data["avancePercentaje"] as number,
        horasEstimadas: data["horasEstimadas"] as number,
        horasActuales: data["horasActuales"] as number,
        ubicacionGPS: (data["ubicacionGPS"] || null) as any,
        observacionesInicio: data["observacionesInicio"] as string | null,
        observaciones: data["observaciones"] as string | null,
        iniciadoPorId: data["iniciadoPorId"] as string | null,
        finalizadoPorId: data["finalizadoPorId"] as string | null,
        fechaInicio: (data["fechaInicio"] as Date) || new Date(),
        fechaTermino: data["fechaTermino"] as Date | null,
      },
    });

    return this.mapToDomain(saved);
  }

  async findById(id: EjecucionId): Promise<Ejecucion | null> {
    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { id: id.getValue() },
      include: {
        tareas: true,
        checklists: true,
        evidenciasEjecucion: true,
        fotosEvidencia: true,
      },
    });

    if (!ejecucion) return null;
    return this.mapToDomain(ejecucion);
  }

  async findByOrdenId(ordenId: string): Promise<Ejecucion | null> {
    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { ordenId },
      include: {
        tareas: true,
        checklists: true,
        evidenciasEjecucion: true,
        fotosEvidencia: true,
      },
    });

    if (!ejecucion) return null;
    return this.mapToDomain(ejecucion);
  }

  async exists(ordenId: string): Promise<boolean> {
    const count = await this.prisma.ejecucion.count({
      where: { ordenId },
    });
    return count > 0;
  }

  async findActiveExecutions(): Promise<Ejecucion[]> {
    const executions = await this.prisma.ejecucion.findMany({
      where: {
        estado: { in: ["en_progreso", "pausada"] },
      },
      include: {
        tareas: true,
        checklists: true,
        evidenciasEjecucion: true,
      },
    });

    return executions.map((e) => this.mapToDomain(e));
  }

  async findByTecnico(
    tecnicoId: string,
    status?: ExecutionStatus,
  ): Promise<Ejecucion[]> {
    const where: any = {
      iniciadoPorId: tecnicoId,
    };

    if (status) {
      where.estado = this.mapStatusToPrisma(status);
    }

    const executions = await this.prisma.ejecucion.findMany({
      where,
      include: {
        tareas: true,
        checklists: true,
        evidenciasEjecucion: true,
      },
    });

    return executions.map((e) => this.mapToDomain(e));
  }

  // ========== TIME LOGS (Stored in memory for now, future: separate table) ==========

  async saveTimeLog(log: TimeLog): Promise<TimeLog> {
    // TimeLog tabla no existe en schema actual, usamos JSON en ejecucion
    this.logger.warn(
      "TimeLog persistence not implemented - storing in aggregate only",
    );
    return log;
  }

  async getTimeLogs(ejecucionId: EjecucionId): Promise<TimeLog[]> {
    // Placeholder until TimeLog table is added
    return [];
  }

  // ========== ACTIVITY LOGS (Stored in memory for now, future: separate table) ==========

  async saveActivityLog(log: ActivityLog): Promise<ActivityLog> {
    this.logger.warn(
      "ActivityLog persistence not implemented - storing in aggregate only",
    );
    return log;
  }

  async getActivityLog(ejecucionId: EjecucionId): Promise<ActivityLog[]> {
    return [];
  }

  // ========== EVIDENCES ==========

  async saveEvidence(evidence: Evidence): Promise<Evidence> {
    const data = evidence.toPersistence();

    await this.prisma.evidenciaEjecucion.create({
      data: {
        id: data["id"] as string,
        ejecucionId: data["ejecucionId"] as string,
        ordenId: "", // Will be set from ejecucion
        tipo: data["type"] as string,
        nombreArchivo: (data["fileUrl"] as string).split("/").pop() || "file",
        rutaArchivo: data["fileUrl"] as string,
        tamano: BigInt(data["fileSize"] as number),
        mimeType: data["mimeType"] as string,
        descripcion: (data["description"] as string) || "",
        ubicacionGPS: (data["capturedLocation"] as object) || undefined,
        subidoPor: data["uploadedBy"] as string,
      },
    });

    return evidence;
  }

  async getEvidences(ejecucionId: EjecucionId): Promise<Evidence[]> {
    const evidencias = await this.prisma.evidenciaEjecucion.findMany({
      where: { ejecucionId: ejecucionId.getValue() },
    });

    return evidencias.map((e) =>
      Evidence.fromPersistence({
        id: e.id,
        ejecucionId: e.ejecucionId,
        type: e.tipo as EvidenceTypeEnum,
        fileUrl: e.rutaArchivo,
        fileSize: Number(e.tamano),
        mimeType: e.mimeType,
        description: e.descripcion,
        capturedLocation: e.ubicacionGPS as Record<string, unknown> | undefined,
        uploadedBy: e.subidoPor,
        uploadedAt: e.createdAt,
      }),
    );
  }

  // ========== PRIVATE MAPPERS ==========

  private mapToDomain(prisma: any): Ejecucion {
    const status = this.mapStatusFromPrisma(prisma.estado);
    const progress = ProgressPercentage.fromValue(prisma.avancePercentaje || 0);
    const location = prisma.ubicacionGPS
      ? GeoLocation.fromJson(prisma.ubicacionGPS as Record<string, unknown>)
      : undefined;

    const props: EjecucionProps = {
      id: EjecucionId.create(prisma.id),
      ordenId: prisma.ordenId,
      planeacionId: prisma.planeacionId,
      status,
      progress,
      horasEstimadas: prisma.horasEstimadas,
      currentLocation: location,
      observacionesInicio: prisma.observacionesInicio,
      observaciones: prisma.observaciones,
      startedBy: prisma.iniciadoPorId,
      completedBy: prisma.finalizadoPorId,
      startedAt: prisma.fechaInicio,
      completedAt: prisma.fechaTermino,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };

    return Ejecucion.fromPersistence(props);
  }

  private mapStatusFromPrisma(estado: string): ExecutionStatus {
    const map: Record<string, ExecutionStatusEnum> = {
      no_iniciada: ExecutionStatusEnum.NOT_STARTED,
      en_progreso: ExecutionStatusEnum.IN_PROGRESS,
      pausada: ExecutionStatusEnum.PAUSED,
      completada: ExecutionStatusEnum.COMPLETED,
    };
    const enumValue = map[estado] || ExecutionStatusEnum.NOT_STARTED;
    return ExecutionStatus.fromString(enumValue);
  }

  private mapStatusToPrisma(status: ExecutionStatus): string {
    const map: Record<ExecutionStatusEnum, string> = {
      [ExecutionStatusEnum.NOT_STARTED]: "no_iniciada",
      [ExecutionStatusEnum.IN_PROGRESS]: "en_progreso",
      [ExecutionStatusEnum.PAUSED]: "pausada",
      [ExecutionStatusEnum.COMPLETED]: "completada",
    };
    return map[status.getValue()];
  }
}
