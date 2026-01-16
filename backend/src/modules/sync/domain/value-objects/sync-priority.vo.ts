/**
 * Sync Priority Value Object
 * Determines the order of sync operations
 */
export enum SyncPriorityType {
  CRITICAL = 'CRITICAL', // Safety-related, must sync first
  HIGH = 'HIGH', // Execution updates, evidence
  MEDIUM = 'MEDIUM', // Checklists, tasks
  LOW = 'LOW', // Non-urgent metadata
}

export class SyncPriority {
  private static readonly PRIORITY_ORDER: Record<SyncPriorityType, number> = {
    [SyncPriorityType.CRITICAL]: 0,
    [SyncPriorityType.HIGH]: 1,
    [SyncPriorityType.MEDIUM]: 2,
    [SyncPriorityType.LOW]: 3,
  };

  private constructor(private readonly value: SyncPriorityType) {}

  static critical(): SyncPriority {
    return new SyncPriority(SyncPriorityType.CRITICAL);
  }

  static high(): SyncPriority {
    return new SyncPriority(SyncPriorityType.HIGH);
  }

  static medium(): SyncPriority {
    return new SyncPriority(SyncPriorityType.MEDIUM);
  }

  static low(): SyncPriority {
    return new SyncPriority(SyncPriorityType.LOW);
  }

  static fromString(value: string): SyncPriority {
    if (!Object.values(SyncPriorityType).includes(value as SyncPriorityType)) {
      throw new Error(`Invalid sync priority: ${value}`);
    }
    return new SyncPriority(value as SyncPriorityType);
  }

  /**
   * Determine priority based on sync item type
   */
  static forItemType(tipo: string): SyncPriority {
    switch (tipo) {
      case 'AST':
      case 'HES':
        return SyncPriority.critical();
      case 'EJECUCION':
      case 'EVIDENCIA':
        return SyncPriority.high();
      case 'CHECKLIST':
      case 'TAREA':
        return SyncPriority.medium();
      case 'COSTO':
      default:
        return SyncPriority.low();
    }
  }

  getValue(): SyncPriorityType {
    return this.value;
  }

  getOrder(): number {
    return SyncPriority.PRIORITY_ORDER[this.value];
  }

  isHigherThan(other: SyncPriority): boolean {
    return this.getOrder() < other.getOrder();
  }

  isLowerThan(other: SyncPriority): boolean {
    return this.getOrder() > other.getOrder();
  }

  equals(other: SyncPriority): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
