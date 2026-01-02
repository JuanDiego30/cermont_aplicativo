import { randomUUID } from 'crypto';

/**
 * Device ID Value Object
 * Uniquely identifies the device performing sync operations
 */
export class DeviceId {
    private constructor(private readonly value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('Device ID cannot be empty');
        }
        if (value.length > 100) {
            throw new Error('Device ID is too long (max 100 characters)');
        }
    }

    static create(value: string): DeviceId {
        return new DeviceId(value.trim());
    }

    static generate(): DeviceId {
        return new DeviceId(randomUUID());
    }

    static fromUserAgent(userAgent: string, userId: string): DeviceId {
        // Create a deterministic device ID from user agent + user ID
        const hash = this.simpleHash(`${userAgent}:${userId}`);
        return new DeviceId(`device_${hash}`);
    }

    private static simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: DeviceId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
