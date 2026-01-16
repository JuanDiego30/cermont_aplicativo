/**
 * @vo TimeDuration
 * Value Object representing a duration in minutes.
 */

export class TimeDuration {
  private constructor(private readonly minutes: number) {
    if (minutes < 0) {
      throw new Error('TimeDuration cannot be negative');
    }
  }

  public static zero(): TimeDuration {
    return new TimeDuration(0);
  }

  public static fromMinutes(minutes: number): TimeDuration {
    return new TimeDuration(Math.round(minutes));
  }

  public static fromHours(hours: number): TimeDuration {
    return new TimeDuration(Math.round(hours * 60));
  }

  public static between(start: Date, end: Date): TimeDuration {
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.max(0, diffMs / (1000 * 60));
    return new TimeDuration(Math.round(diffMinutes));
  }

  public add(other: TimeDuration): TimeDuration {
    return new TimeDuration(this.minutes + other.minutes);
  }

  public subtract(other: TimeDuration): TimeDuration {
    return new TimeDuration(Math.max(0, this.minutes - other.minutes));
  }

  public getTotalMinutes(): number {
    return this.minutes;
  }

  public getTotalHours(): number {
    return this.minutes / 60;
  }

  public getHours(): number {
    return Math.floor(this.minutes / 60);
  }

  public getRemainingMinutes(): number {
    return this.minutes % 60;
  }

  public format(): string {
    const hours = this.getHours();
    const mins = this.getRemainingMinutes();
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  }

  public equals(other: TimeDuration): boolean {
    return this.minutes === other.minutes;
  }

  public isGreaterThan(other: TimeDuration): boolean {
    return this.minutes > other.minutes;
  }

  public toString(): string {
    return this.format();
  }
}
