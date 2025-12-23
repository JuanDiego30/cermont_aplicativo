/**
 * Entity: CondicionesEntrada
 * 
 * Condiciones iniciales del equipo/instalación al momento de entrada
 */

export interface CreateCondicionesEntradaProps {
  estadoGeneral: string;
  equipoFuncional: boolean;
  daniosVisibles?: string[];
  observaciones?: string;
  fotosEntrada?: string[];
}

export class CondicionesEntrada {
  private constructor(
    private readonly _estadoGeneral: string,
    private readonly _equipoFuncional: boolean,
    private readonly _fotosEntrada: string[],
    private readonly _daniosVisibles: string[],
    private readonly _observaciones?: string,
  ) {}

  public static create(props: CreateCondicionesEntradaProps): CondicionesEntrada {
    return new CondicionesEntrada(
      props.estadoGeneral,
      props.equipoFuncional,
      props.fotosEntrada || [],
      props.daniosVisibles || [],
      props.observaciones,
    );
  }

  public getEstadoGeneral(): string {
    return this._estadoGeneral;
  }

  public isEquipoFuncional(): boolean {
    return this._equipoFuncional;
  }

  public getDaniosVisibles(): string[] {
    return [...this._daniosVisibles];
  }

  public tieneDanios(): boolean {
    return this._daniosVisibles.length > 0;
  }

  public getObservaciones(): string | undefined {
    return this._observaciones;
  }

  public getFotosEntrada(): string[] {
    return [...this._fotosEntrada];
  }

  public tieneFotos(): boolean {
    return this._fotosEntrada.length > 0;
  }

  public getResumen(): string {
    const daniosText = this._daniosVisibles.length > 0
      ? `${this._daniosVisibles.length} daño(s) identificado(s)`
      : 'Sin daños visibles';

    return `Estado: ${this._estadoGeneral}. ${
      this._equipoFuncional ? 'Funcional' : 'No funcional'
    }. ${daniosText}.`;
  }
}

