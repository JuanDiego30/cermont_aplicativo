/**
 * @repository IEjecucionRepository
 * Enhanced Repository Interface for Ejecucion Aggregate
 */
import { Ejecucion } from "../entities/ejecucion.entity";
import { EjecucionId } from "../value-objects/ejecucion-id.vo";
import { ExecutionStatus } from "../value-objects/execution-status.vo";
import { TimeLog } from "../entities/time-log.entity";
import { ActivityLog } from "../entities/activity-log.entity";
import { Evidence } from "../entities/evidence.entity";

export const EJECUCION_REPOSITORY = Symbol("EJECUCION_REPOSITORY");

export interface IEjecucionRepository {
  // Aggregate operations
  save(ejecucion: Ejecucion): Promise<Ejecucion>;
  findById(id: EjecucionId): Promise<Ejecucion | null>;
  findByOrdenId(ordenId: string): Promise<Ejecucion | null>;
  exists(ordenId: string): Promise<boolean>;

  // Queries
  findActiveExecutions(): Promise<Ejecucion[]>;
  findByTecnico(
    tecnicoId: string,
    status?: ExecutionStatus,
  ): Promise<Ejecucion[]>;

  // Child entity operations (managed through aggregate but may need direct access for queries)
  saveTimeLog(log: TimeLog): Promise<TimeLog>;
  getTimeLogs(ejecucionId: EjecucionId): Promise<TimeLog[]>;

  saveActivityLog(log: ActivityLog): Promise<ActivityLog>;
  getActivityLog(ejecucionId: EjecucionId): Promise<ActivityLog[]>;

  saveEvidence(evidence: Evidence): Promise<Evidence>;
  getEvidences(ejecucionId: EjecucionId): Promise<Evidence[]>;
}
