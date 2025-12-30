// ============================================
// Value Objects para Domain-Driven Design
// REGLA 3: Validación en la creación
// ============================================

export class Monto {
  private constructor(private readonly value: number) { }

  static create(value: number): Monto {
    if (value < 0) throw new Error('Monto no puede ser negativo');
    if (value > 999999999)
      throw new Error('Monto excede límite máximo permitido');
    // Redondear a 2 decimales
    const rounded = Math.round(value * 100) / 100;
    return new Monto(rounded);
  }

  static zero(): Monto {
    return new Monto(0);
  }

  getValue(): number {
    return this.value;
  }

  add(other: Monto): Monto {
    return Monto.create(this.value + other.getValue());
  }

  subtract(other: Monto): Monto {
    return Monto.create(this.value - other.getValue());
  }

  multiply(factor: number): Monto {
    return Monto.create(this.value * factor);
  }

  isPositivo(): boolean {
    return this.value > 0;
  }

  isNegativo(): boolean {
    return this.value < 0;
  }

  equals(other: Monto): boolean {
    return this.value === other.getValue();
  }
}

export class OrdenNumero {
  private constructor(private readonly value: string) { }

  static create(value: string): OrdenNumero {
    if (!value || value.length === 0) {
      throw new Error('OrdenNumero no puede ser vacío');
    }
    const normalized = value.toUpperCase();
    if (!/^ORD-\d{6,}$/.test(normalized))
      throw new Error('Formato inválido: debe ser ORD-XXXXXX');
    return new OrdenNumero(normalized);
  }

  static generar(): OrdenNumero {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return OrdenNumero.create(`ORD-${timestamp}${random}`);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OrdenNumero): boolean {
    return this.value === other.getValue();
  }
}

export class OrdenEstado {
  readonly PENDIENTE = 'PENDIENTE';
  readonly EN_PROCESO = 'EN_PROCESO';
  readonly COMPLETADA = 'COMPLETADA';
  readonly PAUSADA = 'PAUSADA';
  readonly CANCELADA = 'CANCELADA';

  private constructor(private readonly value: string) { }

  static create(estado: string): OrdenEstado {
    const validos = [
      'PENDIENTE',
      'EN_PROCESO',
      'COMPLETADA',
      'PAUSADA',
      'CANCELADA',
    ];
    if (!validos.includes(estado.toUpperCase())) {
      throw new Error(
        `Estado inválido: ${estado}. Debe ser uno de: ${validos.join(', ')}`,
      );
    }
    return new OrdenEstado(estado.toUpperCase());
  }

  getValue(): string {
    return this.value;
  }

  isPendiente(): boolean {
    return this.value === this.PENDIENTE;
  }

  isEnProceso(): boolean {
    return this.value === this.EN_PROCESO;
  }

  isCompletada(): boolean {
    return this.value === this.COMPLETADA;
  }

  equals(other: OrdenEstado): boolean {
    return this.value === other.getValue();
  }

  // Validar transiciones permitidas
  static esTransicionValida(actual: string, nuevo: string): boolean {
    const transiciones: Record<string, string[]> = {
      PENDIENTE: ['EN_PROCESO', 'CANCELADA'],
      EN_PROCESO: ['COMPLETADA', 'PAUSADA', 'CANCELADA'],
      PAUSADA: ['EN_PROCESO', 'CANCELADA'],
      COMPLETADA: [],
      CANCELADA: [],
    };
    return transiciones[actual]?.includes(nuevo) ?? false;
  }
}
