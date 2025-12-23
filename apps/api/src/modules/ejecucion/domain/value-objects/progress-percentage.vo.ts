/**
 * @vo ProgressPercentage
 * Value Object representing progress (0-100%).
 */

export class ProgressPercentage {
    private constructor(private readonly value: number) {
        if (value < 0 || value > 100) {
            throw new Error(`Progress must be between 0 and 100. Got: ${value}`);
        }
    }

    public static zero(): ProgressPercentage {
        return new ProgressPercentage(0);
    }

    public static complete(): ProgressPercentage {
        return new ProgressPercentage(100);
    }

    public static fromValue(value: number): ProgressPercentage {
        return new ProgressPercentage(Math.round(value * 100) / 100);
    }

    public getValue(): number {
        return this.value;
    }

    public increase(amount: number): ProgressPercentage {
        const newValue = Math.min(100, this.value + amount);
        return new ProgressPercentage(newValue);
    }

    public decrease(amount: number): ProgressPercentage {
        const newValue = Math.max(0, this.value - amount);
        return new ProgressPercentage(newValue);
    }

    public isComplete(): boolean {
        return this.value === 100;
    }

    public getRemainingPercentage(): number {
        return 100 - this.value;
    }

    public format(): string {
        return `${this.value.toFixed(1)}%`;
    }

    public equals(other: ProgressPercentage): boolean {
        return this.value === other.value;
    }

    public isGreaterThan(other: ProgressPercentage): boolean {
        return this.value > other.value;
    }

    public toString(): string {
        return this.format();
    }
}
