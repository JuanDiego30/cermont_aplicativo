/**
 * @entity ActivityLog
 * Immutable record of an activity in the execution timeline.
 */
import { randomUUID } from 'crypto';
import { ActivityType, ActivityTypeEnum } from '../value-objects/activity-type.vo';
import { GeoLocation } from '../value-objects/geo-location.vo';

export interface ActivityLogProps {
    id?: string;
    ejecucionId: string;
    activityType: ActivityTypeEnum;
    description: string;
    location?: GeoLocation;
    performedBy: string;
    timestamp?: Date;
    metadata?: Record<string, unknown>;
}

export class ActivityLog {
    private readonly id: string;
    private readonly ejecucionId: string;
    private readonly activityType: ActivityType;
    private readonly description: string;
    private readonly location?: GeoLocation;
    private readonly performedBy: string;
    private readonly timestamp: Date;
    private readonly metadata?: Record<string, unknown>;

    private constructor(props: ActivityLogProps) {
        this.id = props.id || randomUUID();
        this.ejecucionId = props.ejecucionId;
        this.activityType = ActivityType.fromString(props.activityType);
        this.description = props.description;
        this.location = props.location;
        this.performedBy = props.performedBy;
        this.timestamp = props.timestamp || new Date();
        this.metadata = props.metadata;
    }

    public static create(props: ActivityLogProps): ActivityLog {
        return new ActivityLog(props);
    }

    public static fromPersistence(props: ActivityLogProps & { location?: Record<string, unknown> }): ActivityLog {
        return new ActivityLog({
            ...props,
            location: props.location ? GeoLocation.fromJson(props.location) : undefined,
        });
    }

    public getId(): string {
        return this.id;
    }

    public getEjecucionId(): string {
        return this.ejecucionId;
    }

    public getActivityType(): ActivityType {
        return this.activityType;
    }

    public getDescription(): string {
        return this.description;
    }

    public getLocation(): GeoLocation | undefined {
        return this.location;
    }

    public getPerformedBy(): string {
        return this.performedBy;
    }

    public getTimestamp(): Date {
        return this.timestamp;
    }

    public getMetadata(): Record<string, unknown> | undefined {
        return this.metadata;
    }

    public toPersistence(): Record<string, unknown> {
        return {
            id: this.id,
            ejecucionId: this.ejecucionId,
            activityType: this.activityType.getValue(),
            description: this.description,
            location: this.location?.toJson(),
            performedBy: this.performedBy,
            timestamp: this.timestamp,
            metadata: this.metadata,
        };
    }
}
