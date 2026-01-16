import { EstadoAlertaEnum, EstadoAlertaVO } from '../value-objects/estado-alerta.vo';
import { PrioridadAlertaEnum, PrioridadAlertaVO } from '../value-objects/prioridad-alerta.vo';
import { TipoAlertaEnum, TipoAlertaVO } from '../value-objects/tipo-alerta.vo';

class AlertaId {
  constructor(private readonly value: string) {
    if (!value) {
      throw new Error('AlertaId inválido');
    }
  }

  getValue(): string {
    return this.value;
  }
}

export interface AlertaProps {
  id: string;
  usuarioId: string;
  tipo: TipoAlertaEnum;
  prioridad: PrioridadAlertaEnum;
  titulo: string;
  mensaje: string;
  leida?: boolean;
  resuelta?: boolean;
  createdAt?: Date;
}

export class Alerta {
  private estado: EstadoAlertaVO;

  private constructor(private readonly props: AlertaProps) {
    const estado = props.resuelta
      ? EstadoAlertaEnum.RESUELTA
      : props.leida
        ? EstadoAlertaEnum.LEIDA
        : EstadoAlertaEnum.PENDIENTE;
    this.estado = EstadoAlertaVO.create(estado);
  }

  static fromPersistence(props: AlertaProps): Alerta {
    return new Alerta(props);
  }

  getId(): AlertaId {
    return new AlertaId(this.props.id);
  }

  getDestinatarioId(): string {
    return this.props.usuarioId;
  }

  getTipo(): TipoAlertaVO {
    return TipoAlertaVO.create(this.props.tipo);
  }

  getPrioridad(): PrioridadAlertaVO {
    return PrioridadAlertaVO.create(this.props.prioridad);
  }

  getEstado(): EstadoAlertaVO {
    return this.estado;
  }

  getTitulo(): string {
    return this.props.titulo;
  }

  getMensaje(): string {
    return this.props.mensaje;
  }

  getCreatedAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  marcarComoFallida(_reason?: string): void {
    this.estado = EstadoAlertaVO.create(EstadoAlertaEnum.FALLIDA);
  }
}
