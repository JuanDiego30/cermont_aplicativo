import { PrioridadAlerta } from '@/prisma/client';

export { PrioridadAlerta as PrioridadAlertaEnum };

const PRIORITY_COLORS: Record<PrioridadAlerta, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
  critical: '#b91c1c',
};

export class PrioridadAlertaVO {
  private constructor(private readonly value: PrioridadAlerta) {}

  static create(value: PrioridadAlerta): PrioridadAlertaVO {
    return new PrioridadAlertaVO(value);
  }

  getValue(): PrioridadAlerta {
    return this.value;
  }

  getColor(): string {
    return PRIORITY_COLORS[this.value] ?? '#6b7280';
  }

  esCritica(): boolean {
    return this.value === PrioridadAlerta.critical;
  }
}
