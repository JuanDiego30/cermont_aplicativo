/**
 * @entity TimeLog
 * Represents a period of work during an execution.
 */
import { randomUUID } from "crypto";
import { TimeDuration } from "../value-objects/time-duration.vo";

export interface TimeLogProps {
  id?: string;
  ejecucionId: string;
  startedAt: Date;
  endedAt?: Date;
  isPaused: boolean;
}

export class TimeLog {
  private readonly id: string;
  private readonly ejecucionId: string;
  private readonly startedAt: Date;
  private endedAt?: Date;
  private isPaused: boolean;

  private constructor(props: TimeLogProps) {
    this.id = props.id || randomUUID();
    this.ejecucionId = props.ejecucionId;
    this.startedAt = props.startedAt;
    this.endedAt = props.endedAt;
    this.isPaused = props.isPaused;
  }

  public static create(ejecucionId: string): TimeLog {
    return new TimeLog({
      ejecucionId,
      startedAt: new Date(),
      isPaused: false,
    });
  }

  public static fromPersistence(props: TimeLogProps): TimeLog {
    return new TimeLog(props);
  }

  public getId(): string {
    return this.id;
  }

  public getEjecucionId(): string {
    return this.ejecucionId;
  }

  public getStartedAt(): Date {
    return this.startedAt;
  }

  public getEndedAt(): Date | undefined {
    return this.endedAt;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public isActive(): boolean {
    return !this.endedAt && !this.isPaused;
  }

  public stop(): void {
    if (!this.endedAt) {
      this.endedAt = new Date();
      this.isPaused = true;
    }
  }

  public getDuration(): TimeDuration {
    const end = this.endedAt || new Date();
    return TimeDuration.between(this.startedAt, end);
  }

  public toPersistence(): Record<string, unknown> {
    return {
      id: this.id,
      ejecucionId: this.ejecucionId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      isPaused: this.isPaused,
    };
  }
}
