export enum EstadoAlertaEnum {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  LEIDA = 'leida',
  RESUELTA = 'resuelta',
  FALLIDA = 'fallida',
}

export class EstadoAlertaVO {
  private constructor(private readonly value: EstadoAlertaEnum) {}

  static create(value: EstadoAlertaEnum): EstadoAlertaVO {
    return new EstadoAlertaVO(value);
  }

  getValue(): EstadoAlertaEnum {
    return this.value;
  }
}
