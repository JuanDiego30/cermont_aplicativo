import { Injectable, Logger } from '@nestjs/common';

/**
 * Conflict Resolution Strategy
 */
export enum ConflictStrategy {
    LAST_WRITE_WINS = 'LAST_WRITE_WINS',
    SERVER_WINS = 'SERVER_WINS',
    CLIENT_WINS = 'CLIENT_WINS',
    MERGE = 'MERGE',
    MANUAL = 'MANUAL',
}

export interface ConflictData {
    localData: Record<string, unknown>;
    serverData: Record<string, unknown>;
    localTimestamp: Date;
    serverTimestamp: Date;
    fieldConflicts: string[];
}

export interface ConflictResolution {
    resolved: boolean;
    strategy: ConflictStrategy;
    resultData: Record<string, unknown>;
    requiresManualReview: boolean;
    mergedFields?: string[];
}

/**
 * Conflict Resolver Service
 * Handles sync conflicts using configurable strategies
 */
@Injectable()
export class ConflictResolverService {
    private readonly logger = new Logger(ConflictResolverService.name);
    private defaultStrategy: ConflictStrategy = ConflictStrategy.LAST_WRITE_WINS;

    /**
     * Set default conflict resolution strategy
     */
    setDefaultStrategy(strategy: ConflictStrategy): void {
        this.defaultStrategy = strategy;
        this.logger.log(`Default conflict strategy set to: ${strategy}`);
    }

    /**
     * Resolve conflict between local and server data
     */
    resolve(
        conflict: ConflictData,
        strategy?: ConflictStrategy,
    ): ConflictResolution {
        const resolveStrategy = strategy || this.defaultStrategy;

        this.logger.log(`Resolving conflict with strategy: ${resolveStrategy}`, {
            fieldConflicts: conflict.fieldConflicts.length,
        });

        switch (resolveStrategy) {
            case ConflictStrategy.LAST_WRITE_WINS:
                return this.resolveLastWriteWins(conflict);
            case ConflictStrategy.SERVER_WINS:
                return this.resolveServerWins(conflict);
            case ConflictStrategy.CLIENT_WINS:
                return this.resolveClientWins(conflict);
            case ConflictStrategy.MERGE:
                return this.resolveMerge(conflict);
            case ConflictStrategy.MANUAL:
                return this.resolveManual(conflict);
            default:
                return this.resolveLastWriteWins(conflict);
        }
    }

    /**
     * Detect conflicts between local and server data
     */
    detectConflicts(
        localData: Record<string, unknown>,
        serverData: Record<string, unknown>,
        localTimestamp: Date,
        serverTimestamp: Date,
    ): ConflictData | null {
        const fieldConflicts: string[] = [];

        // Compare each field
        const allKeys = new Set([...Object.keys(localData), ...Object.keys(serverData)]);

        for (const key of allKeys) {
            // Skip metadata fields
            if (['id', 'createdAt', 'updatedAt', 'version'].includes(key)) {
                continue;
            }

            const localValue = localData[key];
            const serverValue = serverData[key];

            if (!this.areEqual(localValue, serverValue)) {
                fieldConflicts.push(key);
            }
        }

        if (fieldConflicts.length === 0) {
            return null; // No conflicts
        }

        return {
            localData,
            serverData,
            localTimestamp,
            serverTimestamp,
            fieldConflicts,
        };
    }

    /**
     * Last Write Wins strategy
     */
    private resolveLastWriteWins(conflict: ConflictData): ConflictResolution {
        const useLocal = conflict.localTimestamp > conflict.serverTimestamp;

        this.logger.debug(`Last Write Wins: ${useLocal ? 'LOCAL' : 'SERVER'} wins`, {
            localTime: conflict.localTimestamp.toISOString(),
            serverTime: conflict.serverTimestamp.toISOString(),
        });

        return {
            resolved: true,
            strategy: ConflictStrategy.LAST_WRITE_WINS,
            resultData: useLocal ? conflict.localData : conflict.serverData,
            requiresManualReview: false,
        };
    }

    /**
     * Server Wins strategy
     */
    private resolveServerWins(conflict: ConflictData): ConflictResolution {
        return {
            resolved: true,
            strategy: ConflictStrategy.SERVER_WINS,
            resultData: conflict.serverData,
            requiresManualReview: false,
        };
    }

    /**
     * Client Wins strategy
     */
    private resolveClientWins(conflict: ConflictData): ConflictResolution {
        return {
            resolved: true,
            strategy: ConflictStrategy.CLIENT_WINS,
            resultData: conflict.localData,
            requiresManualReview: false,
        };
    }

    /**
     * Merge strategy - combines non-conflicting fields
     */
    private resolveMerge(conflict: ConflictData): ConflictResolution {
        const merged: Record<string, unknown> = { ...conflict.serverData };
        const mergedFields: string[] = [];

        // For each field, decide which value to use
        for (const key of conflict.fieldConflicts) {
            const localValue = conflict.localData[key];
            const serverValue = conflict.serverData[key];

            // If local has value and server doesn't, use local
            if (localValue !== undefined && serverValue === undefined) {
                merged[key] = localValue;
                mergedFields.push(key);
            }
            // If both have values, use last write wins for that field
            else if (conflict.localTimestamp > conflict.serverTimestamp) {
                merged[key] = localValue;
                mergedFields.push(key);
            }
        }

        this.logger.debug(`Merge strategy applied`, { mergedFields });

        return {
            resolved: true,
            strategy: ConflictStrategy.MERGE,
            resultData: merged,
            requiresManualReview: false,
            mergedFields,
        };
    }

    /**
     * Manual resolution - returns both versions for user review
     */
    private resolveManual(conflict: ConflictData): ConflictResolution {
        return {
            resolved: false,
            strategy: ConflictStrategy.MANUAL,
            resultData: {
                _conflict: true,
                localVersion: conflict.localData,
                serverVersion: conflict.serverData,
                conflictingFields: conflict.fieldConflicts,
                localTimestamp: conflict.localTimestamp.toISOString(),
                serverTimestamp: conflict.serverTimestamp.toISOString(),
            },
            requiresManualReview: true,
        };
    }

    /**
     * Deep equality check
     */
    private areEqual(a: unknown, b: unknown): boolean {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (a === null || b === null) return a === b;
        if (typeof a !== 'object') return false;

        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            return a.every((item, index) => this.areEqual(item, b[index]));
        }

        // Handle objects
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        const aKeys = Object.keys(aObj);
        const bKeys = Object.keys(bObj);

        if (aKeys.length !== bKeys.length) return false;
        return aKeys.every((key) => this.areEqual(aObj[key], bObj[key]));
    }
}
