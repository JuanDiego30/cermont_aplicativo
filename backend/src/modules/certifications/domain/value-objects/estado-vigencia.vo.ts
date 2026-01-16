/**
 * Estado de vigencia de una certificación
 */
export enum EstadoVigenciaType {
  VIGENTE = "VIGENTE",
  POR_VENCER = "POR_VENCER", // 30 días o menos
  VENCIMIENTO_PROXIMO = "VENCIMIENTO_PROXIMO", // 15 días o menos
  VENCIDA = "VENCIDA",
}

export class EstadoVigencia {
  private static readonly DIAS_ALERTA_30 = 30;
  private static readonly DIAS_ALERTA_15 = 15;
  private static readonly DIAS_ALERTA_7 = 7;

  private constructor(
    private readonly value: EstadoVigenciaType,
    private readonly diasRestantes: number,
  ) {}

  static fromFechaVencimiento(fechaVencimiento: Date): EstadoVigencia {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);

    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return new EstadoVigencia(EstadoVigenciaType.VENCIDA, diasRestantes);
    }
    if (diasRestantes <= this.DIAS_ALERTA_15) {
      return new EstadoVigencia(
        EstadoVigenciaType.VENCIMIENTO_PROXIMO,
        diasRestantes,
      );
    }
    if (diasRestantes <= this.DIAS_ALERTA_30) {
      return new EstadoVigencia(EstadoVigenciaType.POR_VENCER, diasRestantes);
    }
    return new EstadoVigencia(EstadoVigenciaType.VIGENTE, diasRestantes);
  }

  getValue(): EstadoVigenciaType {
    return this.value;
  }

  getDiasRestantes(): number {
    return this.diasRestantes;
  }

  isVigente(): boolean {
    return this.value === EstadoVigenciaType.VIGENTE;
  }

  isPorVencer(): boolean {
    return this.value === EstadoVigenciaType.POR_VENCER;
  }

  isVencimientoProximo(): boolean {
    return this.value === EstadoVigenciaType.VENCIMIENTO_PROXIMO;
  }

  isVencida(): boolean {
    return this.value === EstadoVigenciaType.VENCIDA;
  }

  requiresAlert(): boolean {
    return this.value !== EstadoVigenciaType.VIGENTE;
  }

  getAlertLevel(): "INFO" | "WARNING" | "CRITICAL" | null {
    switch (this.value) {
      case EstadoVigenciaType.POR_VENCER:
        return "INFO";
      case EstadoVigenciaType.VENCIMIENTO_PROXIMO:
        return "WARNING";
      case EstadoVigenciaType.VENCIDA:
        return "CRITICAL";
      default:
        return null;
    }
  }

  getDisplayMessage(): string {
    if (this.isVencida()) {
      return `Vencida hace ${Math.abs(this.diasRestantes)} días`;
    }
    if (this.diasRestantes === 0) {
      return "Vence hoy";
    }
    if (this.diasRestantes === 1) {
      return "Vence mañana";
    }
    return `Vence en ${this.diasRestantes} días`;
  }

  toString(): string {
    return `${this.value} (${this.getDisplayMessage()})`;
  }
}
