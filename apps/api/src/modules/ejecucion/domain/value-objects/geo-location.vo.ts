/**
 * @vo GeoLocation
 * Value Object representing GPS coordinates with Haversine distance calculation.
 */

export interface GeoLocationProps {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: Date;
}

export class GeoLocation {
    private readonly latitude: number;
    private readonly longitude: number;
    private readonly accuracy?: number;
    private readonly timestamp?: Date;

    private constructor(props: GeoLocationProps) {
        if (props.latitude < -90 || props.latitude > 90) {
            throw new Error(`Invalid latitude: ${props.latitude}. Must be between -90 and 90.`);
        }
        if (props.longitude < -180 || props.longitude > 180) {
            throw new Error(`Invalid longitude: ${props.longitude}. Must be between -180 and 180.`);
        }
        this.latitude = props.latitude;
        this.longitude = props.longitude;
        this.accuracy = props.accuracy;
        this.timestamp = props.timestamp || new Date();
    }

    public static create(props: GeoLocationProps): GeoLocation {
        return new GeoLocation(props);
    }

    public static fromJson(json: Record<string, unknown>): GeoLocation {
        return new GeoLocation({
            latitude: json['latitude'] as number,
            longitude: json['longitude'] as number,
            accuracy: json['accuracy'] as number | undefined,
            timestamp: json['timestamp'] ? new Date(json['timestamp'] as string) : undefined,
        });
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public getLongitude(): number {
        return this.longitude;
    }

    public getAccuracy(): number | undefined {
        return this.accuracy;
    }

    public getTimestamp(): Date | undefined {
        return this.timestamp;
    }

    /**
     * Calculate distance to another GeoLocation using Haversine formula.
     * @returns Distance in meters
     */
    public distanceTo(other: GeoLocation): number {
        const R = 6371000; // Earth radius in meters
        const lat1 = this.toRadians(this.latitude);
        const lat2 = this.toRadians(other.latitude);
        const deltaLat = this.toRadians(other.latitude - this.latitude);
        const deltaLon = this.toRadians(other.longitude - this.longitude);

        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public isWithinRadius(center: GeoLocation, radiusMeters: number): boolean {
        return this.distanceTo(center) <= radiusMeters;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    public toJson(): Record<string, unknown> {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            accuracy: this.accuracy,
            timestamp: this.timestamp?.toISOString(),
        };
    }

    public format(): string {
        return `${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
    }

    public equals(other: GeoLocation): boolean {
        return this.latitude === other.latitude && this.longitude === other.longitude;
    }

    public toString(): string {
        return this.format();
    }
}
