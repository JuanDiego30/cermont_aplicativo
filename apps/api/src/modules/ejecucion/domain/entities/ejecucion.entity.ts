/**
 * @entity Ejecucion (Aggregate Root)
 * Represents the execution of an order in the field.
 * Manages state, progress, time tracking, and evidences.
 */
import { EjecucionId } from '../value-objects/ejecucion-id.vo';
import { ExecutionStatus, ExecutionStatusEnum } from '../value-objects/execution-status.vo';
import { ProgressPercentage } from '../value-objects/progress-percentage.vo';
import { GeoLocation } from '../value-objects/geo-location.vo';
import { TimeDuration } from '../value-objects/time-duration.vo';
import { ActivityTypeEnum } from '../value-objects/activity-type.vo';
import { EvidenceTypeEnum } from '../value-objects/evidence-type.vo';
import { TimeLog } from './time-log.entity';
import { ActivityLog } from './activity-log.entity';
import { Evidence } from './evidence.entity';

// Domain Events
export interface DomainEvent {
    eventName: string;
    occurredAt: Date;
    payload: Record<string, unknown>;
}

export interface EjecucionProps {
    id?: EjecucionId;
    ordenId: string;
    planeacionId: string;
    status?: ExecutionStatus;
    progress?: ProgressPercentage;
    horasEstimadas: number;
    currentLocation?: GeoLocation;
    observacionesInicio?: string;
    observaciones?: string;
    startedBy?: string;
    completedBy?: string;
    startedAt?: Date;
    completedAt?: Date;
    timeLogs?: TimeLog[];
    activityLogs?: ActivityLog[];
    evidences?: Evidence[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class Ejecucion {
    private readonly id: EjecucionId;
    private readonly ordenId: string;
    private readonly planeacionId: string;
    private status: ExecutionStatus;
    private progress: ProgressPercentage;
    private readonly horasEstimadas: number;
    private currentLocation?: GeoLocation;
    private observacionesInicio?: string;
    private observaciones?: string;
    private startedBy?: string;
    private completedBy?: string;
    private startedAt?: Date;
    private completedAt?: Date;
    private readonly timeLogs: TimeLog[];
    private readonly activityLogs: ActivityLog[];
    private readonly evidences: Evidence[];
    private readonly createdAt: Date;
    private updatedAt: Date;
    private domainEvents: DomainEvent[] = [];

    private constructor(props: EjecucionProps) {
        this.id = props.id || EjecucionId.generate();
        this.ordenId = props.ordenId;
        this.planeacionId = props.planeacionId;
        this.status = props.status || ExecutionStatus.notStarted();
        this.progress = props.progress || ProgressPercentage.zero();
        this.horasEstimadas = props.horasEstimadas;
        this.currentLocation = props.currentLocation;
        this.observacionesInicio = props.observacionesInicio;
        this.observaciones = props.observaciones;
        this.startedBy = props.startedBy;
        this.completedBy = props.completedBy;
        this.startedAt = props.startedAt;
        this.completedAt = props.completedAt;
        this.timeLogs = props.timeLogs || [];
        this.activityLogs = props.activityLogs || [];
        this.evidences = props.evidences || [];
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }

    /**
     * Factory: Create a new Ejecucion (starts in NOT_STARTED state)
     */
    public static create(props: Omit<EjecucionProps, 'id' | 'status' | 'progress'>): Ejecucion {
        return new Ejecucion({
            ...props,
            id: EjecucionId.generate(),
            status: ExecutionStatus.notStarted(),
            progress: ProgressPercentage.zero(),
        });
    }

    /**
     * Factory: Reconstitute from persistence
     */
    public static fromPersistence(props: EjecucionProps): Ejecucion {
        return new Ejecucion(props);
    }

    // ========== GETTERS ==========

    public getId(): EjecucionId {
        return this.id;
    }

    public getOrdenId(): string {
        return this.ordenId;
    }

    public getPlaneacionId(): string {
        return this.planeacionId;
    }

    public getStatus(): ExecutionStatus {
        return this.status;
    }

    public getProgress(): ProgressPercentage {
        return this.progress;
    }

    public getHorasEstimadas(): number {
        return this.horasEstimadas;
    }

    public getCurrentLocation(): GeoLocation | undefined {
        return this.currentLocation;
    }

    public getStartedBy(): string | undefined {
        return this.startedBy;
    }

    public getCompletedBy(): string | undefined {
        return this.completedBy;
    }

    public getStartedAt(): Date | undefined {
        return this.startedAt;
    }

    public getCompletedAt(): Date | undefined {
        return this.completedAt;
    }

    public getTimeLogs(): TimeLog[] {
        return [...this.timeLogs];
    }

    public getActivityLogs(): ActivityLog[] {
        return [...this.activityLogs];
    }

    public getEvidences(): Evidence[] {
        return [...this.evidences];
    }

    public getObservacionesInicio(): string | undefined {
        return this.observacionesInicio;
    }

    public getObservaciones(): string | undefined {
        return this.observaciones;
    }

    public getDomainEvents(): DomainEvent[] {
        return [...this.domainEvents];
    }

    public clearDomainEvents(): void {
        this.domainEvents = [];
    }

    // ========== CALCULATED ==========

    public getTotalWorkedTime(): TimeDuration {
        return this.timeLogs.reduce(
            (acc, log) => acc.add(log.getDuration()),
            TimeDuration.zero(),
        );
    }

    public getActiveTimeLog(): TimeLog | undefined {
        return this.timeLogs.find((log) => log.isActive());
    }

    // ========== COMMANDS (State Machine) ==========

    /**
     * Start the execution. Transitions: NOT_STARTED -> IN_PROGRESS
     */
    public start(startedBy: string, location?: GeoLocation, initialNote?: string): void {
        const newStatus = ExecutionStatus.inProgress();
        if (!this.status.canTransitionTo(newStatus)) {
            throw new Error(`Cannot start execution: current status is ${this.status.getValue()}`);
        }

        this.status = newStatus;
        this.startedBy = startedBy;
        this.startedAt = new Date();
        this.currentLocation = location;
        this.observacionesInicio = initialNote;
        this.updatedAt = new Date();

        // Create first time log
        const timeLog = TimeLog.create(this.id.getValue());
        this.timeLogs.push(timeLog);

        // Create activity log
        this.addActivityLog(ActivityTypeEnum.START, 'Ejecución iniciada', startedBy, location);

        // Publish event
        this.addDomainEvent('execution.started', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            startedBy,
            location: location?.toJson(),
        });
    }

    /**
     * Pause the execution. Transitions: IN_PROGRESS -> PAUSED
     */
    public pause(pausedBy: string, reason: string): void {
        const newStatus = ExecutionStatus.paused();
        if (!this.status.canTransitionTo(newStatus)) {
            throw new Error(`Cannot pause execution: current status is ${this.status.getValue()}`);
        }

        this.status = newStatus;
        this.updatedAt = new Date();

        // Stop active time log
        const activeLog = this.getActiveTimeLog();
        if (activeLog) {
            activeLog.stop();
        }

        // Create activity log
        this.addActivityLog(ActivityTypeEnum.PAUSE, `Pausada: ${reason}`, pausedBy);

        // Publish event
        this.addDomainEvent('execution.paused', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            pausedBy,
            reason,
        });
    }

    /**
     * Resume the execution. Transitions: PAUSED -> IN_PROGRESS
     */
    public resume(resumedBy: string, location?: GeoLocation): void {
        const newStatus = ExecutionStatus.inProgress();
        if (!this.status.canTransitionTo(newStatus)) {
            throw new Error(`Cannot resume execution: current status is ${this.status.getValue()}`);
        }

        this.status = newStatus;
        this.currentLocation = location;
        this.updatedAt = new Date();

        // Create new time log
        const timeLog = TimeLog.create(this.id.getValue());
        this.timeLogs.push(timeLog);

        // Create activity log
        this.addActivityLog(ActivityTypeEnum.RESUME, 'Ejecución reanudada', resumedBy, location);

        // Publish event
        this.addDomainEvent('execution.resumed', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            resumedBy,
            location: location?.toJson(),
        });
    }

    /**
     * Update progress percentage
     */
    public updateProgress(newProgress: ProgressPercentage, updatedBy: string, notes?: string): void {
        if (!this.status.canUpdate()) {
            throw new Error(`Cannot update progress: current status is ${this.status.getValue()}`);
        }

        const oldProgress = this.progress;
        this.progress = newProgress;
        if (notes) {
            this.observaciones = notes;
        }
        this.updatedAt = new Date();

        // Create activity log
        this.addActivityLog(
            ActivityTypeEnum.UPDATE_PROGRESS,
            `Progreso: ${oldProgress.getValue()}% → ${newProgress.getValue()}%`,
            updatedBy,
        );

        // Publish event
        this.addDomainEvent('execution.progress-updated', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            oldProgress: oldProgress.getValue(),
            newProgress: newProgress.getValue(),
            updatedBy,
        });
    }

    /**
     * Update current location
     */
    public updateLocation(location: GeoLocation, updatedBy: string): void {
        const oldLocation = this.currentLocation;
        this.currentLocation = location;
        this.updatedAt = new Date();

        // Create activity log
        this.addActivityLog(ActivityTypeEnum.UPDATE_LOCATION, 'Ubicación actualizada', updatedBy, location);

        // Publish event
        this.addDomainEvent('execution.location-updated', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            oldLocation: oldLocation?.toJson(),
            newLocation: location.toJson(),
        });
    }

    /**
     * Add evidence
     */
    public addEvidence(evidence: Evidence, uploadedBy: string): void {
        this.evidences.push(evidence);
        this.updatedAt = new Date();

        // Create activity log
        this.addActivityLog(
            ActivityTypeEnum.UPLOAD_EVIDENCE,
            `Evidencia subida: ${evidence.getType().getValue()}`,
            uploadedBy,
            evidence.getCapturedLocation(),
        );

        // Publish event
        this.addDomainEvent('execution.evidence-uploaded', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            evidenceId: evidence.getId(),
            evidenceType: evidence.getType().getValue(),
            uploadedBy,
        });
    }

    /**
     * Complete the execution. Transitions: IN_PROGRESS -> COMPLETED
     */
    public complete(completedBy: string, finalNotes?: string): void {
        const newStatus = ExecutionStatus.completed();
        if (!this.status.canTransitionTo(newStatus)) {
            throw new Error(`Cannot complete execution: current status is ${this.status.getValue()}`);
        }

        if (!this.progress.isComplete()) {
            throw new Error(`Cannot complete execution: progress is ${this.progress.getValue()}%, must be 100%`);
        }

        this.status = newStatus;
        this.completedBy = completedBy;
        this.completedAt = new Date();
        if (finalNotes) {
            this.observaciones = finalNotes;
        }
        this.updatedAt = new Date();

        // Stop active time log
        const activeLog = this.getActiveTimeLog();
        if (activeLog) {
            activeLog.stop();
        }

        // Create activity log
        this.addActivityLog(ActivityTypeEnum.COMPLETE, 'Ejecución completada', completedBy);

        // Publish event
        this.addDomainEvent('execution.completed', {
            ejecucionId: this.id.getValue(),
            ordenId: this.ordenId,
            completedBy,
            totalDuration: this.getTotalWorkedTime().format(),
            finalProgress: this.progress.getValue(),
        });
    }

    // ========== PRIVATE HELPERS ==========

    private addActivityLog(
        activityType: ActivityTypeEnum,
        description: string,
        performedBy: string,
        location?: GeoLocation,
        metadata?: Record<string, unknown>,
    ): void {
        const log = ActivityLog.create({
            ejecucionId: this.id.getValue(),
            activityType,
            description,
            performedBy,
            location,
            metadata,
        });
        this.activityLogs.push(log);
    }

    private addDomainEvent(eventName: string, payload: Record<string, unknown>): void {
        this.domainEvents.push({
            eventName,
            occurredAt: new Date(),
            payload,
        });
    }

    // ========== PERSISTENCE ==========

    public toPersistence(): Record<string, unknown> {
        return {
            id: this.id.getValue(),
            ordenId: this.ordenId,
            planeacionId: this.planeacionId,
            estado: this.mapStatusToPrisma(),
            avancePercentaje: this.progress.getValue(),
            horasEstimadas: this.horasEstimadas,
            horasActuales: this.getTotalWorkedTime().getTotalHours(),
            ubicacionGPS: this.currentLocation?.toJson(),
            observacionesInicio: this.observacionesInicio,
            observaciones: this.observaciones,
            iniciadoPorId: this.startedBy,
            finalizadoPorId: this.completedBy,
            fechaInicio: this.startedAt,
            fechaTermino: this.completedAt,
        };
    }

    private mapStatusToPrisma(): string {
        const map: Record<ExecutionStatusEnum, string> = {
            [ExecutionStatusEnum.NOT_STARTED]: 'no_iniciada',
            [ExecutionStatusEnum.IN_PROGRESS]: 'en_progreso',
            [ExecutionStatusEnum.PAUSED]: 'pausada',
            [ExecutionStatusEnum.COMPLETED]: 'completada',
        };
        return map[this.status.getValue()];
    }
}
