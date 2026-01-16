export enum CanalNotificacionEnum {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export class CanalNotificacion {
  private constructor(private readonly value: CanalNotificacionEnum) {}

  static create(value: string): CanalNotificacion {
    const normalized = value.toUpperCase() as CanalNotificacionEnum;
    if (!Object.values(CanalNotificacionEnum).includes(normalized)) {
      throw new Error(`Canal de notificación inválido: ${value}`);
    }
    return new CanalNotificacion(normalized);
  }

  getValue(): CanalNotificacionEnum {
    return this.value;
  }
}
