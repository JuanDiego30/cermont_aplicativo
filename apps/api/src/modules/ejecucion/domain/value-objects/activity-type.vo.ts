/**
 * @vo ActivityType
 * Value Object representing the type of activity in an execution timeline.
 */

export enum ActivityTypeEnum {
    START = 'START',
    PAUSE = 'PAUSE',
    RESUME = 'RESUME',
    UPDATE_PROGRESS = 'UPDATE_PROGRESS',
    UPDATE_LOCATION = 'UPDATE_LOCATION',
    ADD_NOTE = 'ADD_NOTE',
    UPLOAD_EVIDENCE = 'UPLOAD_EVIDENCE',
    COMPLETE = 'COMPLETE',
}

export class ActivityType {
    private constructor(private readonly value: ActivityTypeEnum) { }

    public static start(): ActivityType {
        return new ActivityType(ActivityTypeEnum.START);
    }

    public static pause(): ActivityType {
        return new ActivityType(ActivityTypeEnum.PAUSE);
    }

    public static resume(): ActivityType {
        return new ActivityType(ActivityTypeEnum.RESUME);
    }

    public static updateProgress(): ActivityType {
        return new ActivityType(ActivityTypeEnum.UPDATE_PROGRESS);
    }

    public static updateLocation(): ActivityType {
        return new ActivityType(ActivityTypeEnum.UPDATE_LOCATION);
    }

    public static addNote(): ActivityType {
        return new ActivityType(ActivityTypeEnum.ADD_NOTE);
    }

    public static uploadEvidence(): ActivityType {
        return new ActivityType(ActivityTypeEnum.UPLOAD_EVIDENCE);
    }

    public static complete(): ActivityType {
        return new ActivityType(ActivityTypeEnum.COMPLETE);
    }

    public static fromString(value: string): ActivityType {
        const upperValue = value.toUpperCase();
        if (!Object.values(ActivityTypeEnum).includes(upperValue as ActivityTypeEnum)) {
            throw new Error(`Invalid ActivityType: ${value}`);
        }
        return new ActivityType(upperValue as ActivityTypeEnum);
    }

    public getValue(): ActivityTypeEnum {
        return this.value;
    }

    public equals(other: ActivityType): boolean {
        return this.value === other.value;
    }

    public toString(): string {
        return this.value;
    }
}
