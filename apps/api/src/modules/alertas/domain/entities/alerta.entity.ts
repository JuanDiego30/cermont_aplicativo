/**
 * Aggregate Root: Alerta
 *
 * Representa una notificación del sistema Cermont
 *
 * Invariantes:
 * - Siempre tiene un tipo y prioridad válidos
 * - Máximo 3 intentos de reenvío
 * - Solo puede marcarse como leída si fue enviada
 * - Canales debe tener al menos 1 elemento
 *
 * Domain Events:
 * - AlertaEnviadaEvent: cuando se envía exitosamente
 * - AlertaFallidaEvent: cuando falla el envío
 */

import { AlertaId } from "../value-objects/alerta-id.vo";
import { TipoAlerta } from "../value-objects/tipo-alerta.vo";
import { PrioridadAlerta } from "../value-objects/prioridad-alerta.vo";
import { CanalNotificacion } from "../value-objects/canal-notificacion.vo";
import {
  EstadoAlerta,
  EstadoAlertaEnum,
} from "../value-objects/estado-alerta.vo";
import { AlertaEnviadaEvent } from "../events/alerta-enviada.event";
import { AlertaFallidaEvent } from "../events/alerta-fallida.event";
import { ValidationError, BusinessRuleViolationError } from "../exceptions";
import { BaseDomainEntity } from "./base-domain.entity";

export class Alerta extends BaseDomainEntity {
  // Configuración
  private static readonly MAX_INTENTOS = 3;
  private static readonly MIN_TITULO_LENGTH = 3;
  private static readonly MAX_TITULO_LENGTH = 100;
  private static readonly MIN_MENSAJE_LENGTH = 10;
  private static readonly MAX_MENSAJE_LENGTH = 500;

  private constructor(
    private readonly _id: AlertaId,
    private readonly _tipo: TipoAlerta,
    private readonly _prioridad: PrioridadAlerta,
    private readonly _titulo: string,
    private readonly _mensaje: string,
    private readonly _destinatarioId: string,
    private readonly _canales: CanalNotificacion[],
    private _estado: EstadoAlerta,
    private _intentosEnvio: number,
    private _enviadaEn?: Date,
    private _leidaEn?: Date,
    private readonly _metadata?: Record<string, any>,
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
   * Crear nueva alerta
   */
  public static create(props: {
    tipo: string;
    prioridad: string;
    titulo: string;
    mensaje: string;
    destinatarioId: string;
    canales: string[];
    metadata?: Record<string, any>;
  }): Alerta {
    // Validar y crear VOs
    const id = AlertaId.generate();
    const tipo = TipoAlerta.create(props.tipo);
    const prioridad = PrioridadAlerta.create(props.prioridad);
    const canales = CanalNotificacion.createMultiple(props.canales);
    const estado = EstadoAlerta.pendiente();

    // Validar titulo
    if (!props.titulo || props.titulo.trim().length < this.MIN_TITULO_LENGTH) {
      throw new ValidationError(
        `Título debe tener al menos ${this.MIN_TITULO_LENGTH} caracteres`,
        "titulo",
      );
    }
    if (props.titulo.length > this.MAX_TITULO_LENGTH) {
      throw new ValidationError(
        `Título no puede exceder ${this.MAX_TITULO_LENGTH} caracteres`,
        "titulo",
      );
    }

    // Validar mensaje
    if (
      !props.mensaje ||
      props.mensaje.trim().length < this.MIN_MENSAJE_LENGTH
    ) {
      throw new ValidationError(
        `Mensaje debe tener al menos ${this.MIN_MENSAJE_LENGTH} caracteres`,
        "mensaje",
      );
    }
    if (props.mensaje.length > this.MAX_MENSAJE_LENGTH) {
      throw new ValidationError(
        `Mensaje no puede exceder ${this.MAX_MENSAJE_LENGTH} caracteres`,
        "mensaje",
      );
    }

    // Validar destinatario
    if (!props.destinatarioId || props.destinatarioId.trim().length === 0) {
      throw new ValidationError("Destinatario es requerido", "destinatarioId");
    }

    // Validar canales
    if (!props.canales || props.canales.length === 0) {
      throw new ValidationError(
        "Debe especificar al menos un canal de notificación",
        "canales",
      );
    }

    const now = new Date();

    return new Alerta(
      id,
      tipo,
      prioridad,
      props.titulo.trim(),
      props.mensaje.trim(),
      props.destinatarioId,
      canales,
      estado,
      0, // intentos
      undefined, // enviadaEn
      undefined, // leidaEn
      props.metadata,
      now,
      now,
    );
  }

  /**
   * Recrear desde BD (hydration)
   */
  public static fromPersistence(props: {
    id: string;
    tipo: string;
    prioridad: string;
    titulo: string;
    mensaje: string;
    destinatarioId: string;
    canales: string[];
    estado: string;
    intentosEnvio: number;
    enviadaEn?: Date;
    leidaEn?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  }): Alerta {
    return new Alerta(
      AlertaId.create(props.id),
      TipoAlerta.create(props.tipo),
      PrioridadAlerta.create(props.prioridad),
      props.titulo,
      props.mensaje,
      props.destinatarioId,
      CanalNotificacion.createMultiple(props.canales),
      EstadoAlerta.create(props.estado),
      props.intentosEnvio,
      props.enviadaEn,
      props.leidaEn,
      props.metadata,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Marcar como enviada exitosamente por un canal
   */
  public marcarComoEnviada(canal: CanalNotificacion): void {
    if (!this._estado.isPendiente() && !this._estado.isFallida()) {
      throw new BusinessRuleViolationError(
        "Solo se pueden marcar como enviadas las alertas pendientes o fallidas",
        "ESTADO_INVALIDO",
      );
    }

    this._estado = EstadoAlerta.enviada();
    this._enviadaEn = new Date();
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new AlertaEnviadaEvent({
        alertaId: this._id.getValue(),
        canal: canal.getValue(),
        destinatarioId: this._destinatarioId,
        timestamp: this._enviadaEn,
      }),
    );
  }

  /**
   * Marcar como fallida
   */
  public marcarComoFallida(error: string): void {
    this._estado = EstadoAlerta.fallida();
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new AlertaFallidaEvent({
        alertaId: this._id.getValue(),
        destinatarioId: this._destinatarioId,
        intentos: this._intentosEnvio,
        error,
        timestamp: this._updatedAt,
      }),
    );
  }

  /**
   * Marcar como leída
   */
  public marcarComoLeida(): void {
    if (!this._estado.puedeMarcarseComoLeida()) {
      throw new BusinessRuleViolationError(
        "Solo se pueden marcar como leídas las alertas que fueron enviadas",
        "ESTADO_INVALIDO",
      );
    }

    if (this._leidaEn) {
      throw new BusinessRuleViolationError(
        "La alerta ya fue marcada como leída",
        "YA_LEIDA",
      );
    }

    this._estado = EstadoAlerta.leida();
    this._leidaEn = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Incrementar contador de intentos
   */
  public incrementarIntentos(): void {
    if (this._intentosEnvio >= Alerta.MAX_INTENTOS) {
      throw new BusinessRuleViolationError(
        `Se alcanzó el máximo de intentos (${Alerta.MAX_INTENTOS})`,
        "MAX_INTENTOS_ALCANZADO",
      );
    }

    this._intentosEnvio++;
    this._updatedAt = new Date();
  }

  /**
   * Verificar si puede reintentar envío
   */
  public puedeReintentar(): boolean {
    return (
      this._estado.isFallida() && this._intentosEnvio < Alerta.MAX_INTENTOS
    );
  }

  /**
   * Verificar si es crítica
   */
  public esCritica(): boolean {
    return this._prioridad.esCritica();
  }

  /**
   * Verificar si requiere envío por un canal específico
   */
  public requiereEnvioPorCanal(canal: CanalNotificacion): boolean {
    return this._canales.some((c) => c.equals(canal));
  }

  /**
   * Obtener canales que requieren servicio externo
   */
  public getCanalesExternos(): CanalNotificacion[] {
    return this._canales.filter((c) => c.requiresExternalService());
  }

  /**
   * Verificar si fue leída
   */
  public fueLeida(): boolean {
    return this._leidaEn !== undefined;
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getId(): AlertaId {
    return this._id;
  }

  public getTipo(): TipoAlerta {
    return this._tipo;
  }

  public getPrioridad(): PrioridadAlerta {
    return this._prioridad;
  }

  public getTitulo(): string {
    return this._titulo;
  }

  public getMensaje(): string {
    return this._mensaje;
  }

  public getDestinatarioId(): string {
    return this._destinatarioId;
  }

  public getCanales(): CanalNotificacion[] {
    return [...this._canales]; // Retornar copia
  }

  public getEstado(): EstadoAlerta {
    return this._estado;
  }

  public getIntentosEnvio(): number {
    return this._intentosEnvio;
  }

  public getEnviadaEn(): Date | undefined {
    return this._enviadaEn;
  }

  public getLeidaEn(): Date | undefined {
    return this._leidaEn;
  }

  public getMetadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  public toPersistence(): {
    id: string;
    tipo: string;
    prioridad: string;
    titulo: string;
    mensaje: string;
    destinatarioId: string;
    canales: string[];
    estado: string;
    intentosEnvio: number;
    enviadaEn?: Date;
    leidaEn?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      tipo: this._tipo.getValue(),
      prioridad: this._prioridad.getValue(),
      titulo: this._titulo,
      mensaje: this._mensaje,
      destinatarioId: this._destinatarioId,
      canales: this._canales.map((c) => c.getValue()),
      estado: this._estado.getValue(),
      intentosEnvio: this._intentosEnvio,
      enviadaEn: this._enviadaEn,
      leidaEn: this._leidaEn,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════

  private validate(): void {
    // Invariantes que involucren múltiples propiedades
    if (this._canales.length === 0) {
      throw new BusinessRuleViolationError(
        "Una alerta debe tener al menos un canal de notificación",
        "CANALES_VACIOS",
      );
    }

    if (this._intentosEnvio < 0) {
      throw new BusinessRuleViolationError(
        "El número de intentos no puede ser negativo",
        "INTENTOS_NEGATIVOS",
      );
    }

    if (this._intentosEnvio > Alerta.MAX_INTENTOS) {
      throw new BusinessRuleViolationError(
        `El número de intentos no puede exceder ${Alerta.MAX_INTENTOS}`,
        "INTENTOS_EXCEDIDOS",
      );
    }
  }
}
