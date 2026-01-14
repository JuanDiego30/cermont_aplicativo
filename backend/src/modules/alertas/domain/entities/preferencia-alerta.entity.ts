/**
 * Entity: PreferenciaAlerta
 *
 * Representa las preferencias de notificaciones de un usuario
 *
 * Invariantes:
 * - Siempre tiene al menos un canal preferido
 * - UsuarioId es requerido
 * - TipoAlerta es válido
 */

import { TipoAlerta } from "../value-objects/tipo-alerta.vo";
import { CanalNotificacion } from "../value-objects/canal-notificacion.vo";
import { AlertaId } from "../value-objects/alerta-id.vo";
import { ValidationError } from "../exceptions";
import { BaseDomainEntity } from "./base-domain.entity";

export class PreferenciaAlerta extends BaseDomainEntity {
  private constructor(
    private readonly _id: string,
    private readonly _usuarioId: string,
    private readonly _tipoAlerta: TipoAlerta,
    private _canalesPreferidos: CanalNotificacion[],
    private _noMolestar: boolean,
    private _horariosPermitidos?: { inicio: string; fin: string },
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    super(createdAt, updatedAt);
    this.validate();
  }

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crear nueva preferencia
   */
  public static create(props: {
    usuarioId: string;
    tipoAlerta: string;
    canalesPreferidos: string[];
    noMolestar?: boolean;
    horariosPermitidos?: { inicio: string; fin: string };
  }): PreferenciaAlerta {
    const tipo = TipoAlerta.create(props.tipoAlerta);
    const canales = CanalNotificacion.createMultiple(props.canalesPreferidos);

    return new PreferenciaAlerta(
      AlertaId.generate().getValue(), // ID simple
      props.usuarioId,
      tipo,
      canales,
      props.noMolestar || false,
      props.horariosPermitidos,
      new Date(),
      new Date(),
    );
  }

  /**
   * Recrear desde BD (hydration)
   */
  public static fromPersistence(props: {
    id: string;
    usuarioId: string;
    tipoAlerta: string;
    canalesPreferidos: string[];
    noMolestar: boolean;
    horariosPermitidos?: { inicio: string; fin: string };
    createdAt: Date;
    updatedAt: Date;
  }): PreferenciaAlerta {
    return new PreferenciaAlerta(
      props.id,
      props.usuarioId,
      TipoAlerta.create(props.tipoAlerta),
      CanalNotificacion.createMultiple(props.canalesPreferidos),
      props.noMolestar,
      props.horariosPermitidos,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Verificar si permite notificación en un canal específico
   */
  public permiteNotificacionEn(canal: CanalNotificacion): boolean {
    if (this._noMolestar) {
      return false;
    }
    return this._canalesPreferidos.some((c) => c.equals(canal));
  }

  /**
   * Verificar si está en horario permitido
   */
  public estaEnHorarioPermitido(timestamp: Date = new Date()): boolean {
    if (!this._horariosPermitidos) {
      return true; // Sin restricción de horario
    }

    const hora = timestamp.getHours() * 100 + timestamp.getMinutes();
    const [inicioH, inicioM] = this._horariosPermitidos.inicio
      .split(":")
      .map(Number);
    const [finH, finM] = this._horariosPermitidos.fin.split(":").map(Number);
    const inicio = inicioH * 100 + inicioM;
    const fin = finH * 100 + finM;

    return hora >= inicio && hora <= fin;
  }

  /**
   * Activar modo "no molestar"
   */
  public activarNoMolestar(): void {
    this._noMolestar = true;
    this._updatedAt = new Date();
  }

  /**
   * Desactivar modo "no molestar"
   */
  public desactivarNoMolestar(): void {
    this._noMolestar = false;
    this._updatedAt = new Date();
  }

  /**
   * Actualizar canales preferidos
   */
  public actualizarCanales(canales: string[]): void {
    if (!canales || canales.length === 0) {
      throw new ValidationError(
        "Debe especificar al menos un canal",
        "canales",
      );
    }
    this._canalesPreferidos = CanalNotificacion.createMultiple(canales);
    this._updatedAt = new Date();
  }

  /**
   * Actualizar horarios permitidos
   */
  public actualizarHorarios(horarios?: { inicio: string; fin: string }): void {
    if (horarios) {
      // Validar formato HH:MM
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(horarios.inicio) || !timeRegex.test(horarios.fin)) {
        throw new ValidationError(
          "Formato de horario inválido. Use HH:MM (24h)",
          "horariosPermitidos",
        );
      }
    }
    this._horariosPermitidos = horarios;
    this._updatedAt = new Date();
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getId(): string {
    return this._id;
  }

  public getUsuarioId(): string {
    return this._usuarioId;
  }

  public getTipoAlerta(): TipoAlerta {
    return this._tipoAlerta;
  }

  public getCanalesPreferidos(): CanalNotificacion[] {
    return [...this._canalesPreferidos]; // Retornar copia
  }

  public isNoMolestar(): boolean {
    return this._noMolestar;
  }

  public getHorariosPermitidos(): { inicio: string; fin: string } | undefined {
    return this._horariosPermitidos
      ? { ...this._horariosPermitidos }
      : undefined;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  public toPersistence(): {
    id: string;
    usuarioId: string;
    tipoAlerta: string;
    canalesPreferidos: string[];
    noMolestar: boolean;
    horariosPermitidos?: { inicio: string; fin: string };
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      usuarioId: this._usuarioId,
      tipoAlerta: this._tipoAlerta.getValue(),
      canalesPreferidos: this._canalesPreferidos.map((c) => c.getValue()),
      noMolestar: this._noMolestar,
      horariosPermitidos: this._horariosPermitidos,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════

  private validate(): void {
    if (!this._usuarioId || this._usuarioId.trim().length === 0) {
      throw new ValidationError("UsuarioId es requerido", "usuarioId");
    }

    if (this._canalesPreferidos.length === 0) {
      throw new ValidationError(
        "Debe tener al menos un canal preferido",
        "canalesPreferidos",
      );
    }
  }
}
