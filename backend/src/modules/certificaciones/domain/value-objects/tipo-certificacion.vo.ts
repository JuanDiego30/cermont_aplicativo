/**
 * Tipo de certificación para técnicos
 */
export enum TipoCertificacionTecnico {
  TRABAJO_ALTURAS = "TRABAJO_ALTURAS",
  ATG = "ATG",
  ESPACIOS_CONFINADOS = "ESPACIOS_CONFINADOS",
  ELECTRICISTA = "ELECTRICISTA",
  OPERADOR_EQUIPO = "OPERADOR_EQUIPO",
  SOLDADOR = "SOLDADOR",
  RIGGER = "RIGGER",
  PRIMEROS_AUXILIOS = "PRIMEROS_AUXILIOS",
  MANEJO_DEFENSIVO = "MANEJO_DEFENSIVO",
}

/**
 * Tipo de certificación para equipos
 */
export enum TipoCertificacionEquipo {
  LINEA_VIDA_VERTICAL = "LINEA_VIDA_VERTICAL",
  LINEA_VIDA_HORIZONTAL = "LINEA_VIDA_HORIZONTAL",
  ANDAMIO = "ANDAMIO",
  ARNES = "ARNES",
  HERRAMIENTA_ELECTRICA = "HERRAMIENTA_ELECTRICA",
  EQUIPO_IZAJE = "EQUIPO_IZAJE",
  EXTINTOR = "EXTINTOR",
  ESCALERA = "ESCALERA",
}

export class TipoCertificacion {
  private constructor(private readonly value: string) {}

  static tecnico(tipo: TipoCertificacionTecnico): TipoCertificacion {
    return new TipoCertificacion(tipo);
  }

  static equipo(tipo: TipoCertificacionEquipo): TipoCertificacion {
    return new TipoCertificacion(tipo);
  }

  static fromString(value: string): TipoCertificacion {
    if (
      Object.values(TipoCertificacionTecnico).includes(
        value as TipoCertificacionTecnico,
      )
    ) {
      return new TipoCertificacion(value);
    }
    if (
      Object.values(TipoCertificacionEquipo).includes(
        value as TipoCertificacionEquipo,
      )
    ) {
      return new TipoCertificacion(value);
    }
    throw new Error(`Invalid certification type: ${value}`);
  }

  getValue(): string {
    return this.value;
  }

  isTecnico(): boolean {
    return Object.values(TipoCertificacionTecnico).includes(
      this.value as TipoCertificacionTecnico,
    );
  }

  isEquipo(): boolean {
    return Object.values(TipoCertificacionEquipo).includes(
      this.value as TipoCertificacionEquipo,
    );
  }

  getDisplayName(): string {
    const displayNames: Record<string, string> = {
      TRABAJO_ALTURAS: "Trabajo en Alturas",
      ATG: "ATG (Atmósferas Tóxicas o Gases)",
      ESPACIOS_CONFINADOS: "Espacios Confinados",
      ELECTRICISTA: "Electricista",
      OPERADOR_EQUIPO: "Operador de Equipo",
      SOLDADOR: "Soldador",
      RIGGER: "Rigger",
      PRIMEROS_AUXILIOS: "Primeros Auxilios",
      MANEJO_DEFENSIVO: "Manejo Defensivo",
      LINEA_VIDA_VERTICAL: "Línea de Vida Vertical",
      LINEA_VIDA_HORIZONTAL: "Línea de Vida Horizontal",
      ANDAMIO: "Andamio",
      ARNES: "Arnés",
      HERRAMIENTA_ELECTRICA: "Herramienta Eléctrica",
      EQUIPO_IZAJE: "Equipo de Izaje",
      EXTINTOR: "Extintor",
      ESCALERA: "Escalera",
    };
    return displayNames[this.value] || this.value;
  }

  toString(): string {
    return this.value;
  }
}
