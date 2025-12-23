/**
 * Entity: FirmaDigital
 * 
 * Firma digital capturada (base64 + metadata)
 */

import { ValidationError } from '../../../../common/domain/exceptions';

export interface CreateFirmaDigitalProps {
  imagenBase64: string;
  firmadoPor: string;
  identificacion: string;
  ipAddress?: string;
  userAgent?: string;
}

export class FirmaDigital {
  private constructor(
    private readonly _imagenBase64: string,
    private readonly _firmadoPor: string,
    private readonly _identificacion: string,
    private readonly _fechaHora: Date,
    private readonly _ipAddress?: string,
    private readonly _userAgent?: string,
  ) {}

  public static create(props: CreateFirmaDigitalProps): FirmaDigital {
    const firma = new FirmaDigital(
      props.imagenBase64,
      props.firmadoPor,
      props.identificacion,
      new Date(),
      props.ipAddress,
      props.userAgent,
    );

    firma.validate();
    return firma;
  }

  private validate(): void {
    if (!this._imagenBase64 || this._imagenBase64.trim() === '') {
      throw new ValidationError('Imagen de firma es requerida');
    }

    if (!this._imagenBase64.startsWith('data:image/')) {
      throw new ValidationError('Formato de firma inválido. Debe ser una imagen base64');
    }

    // Validar que sea base64 válido
    const base64Data = this._imagenBase64.split(',')[1];
    if (!base64Data) {
      throw new ValidationError('Formato de firma inválido. Falta datos base64');
    }

    try {
      Buffer.from(base64Data, 'base64');
    } catch {
      throw new ValidationError('Formato de firma inválido. Base64 no válido');
    }

    if (!this._firmadoPor || this._firmadoPor.trim() === '') {
      throw new ValidationError('Nombre del firmante es requerido');
    }

    if (this._firmadoPor.length < 2) {
      throw new ValidationError('Nombre del firmante debe tener al menos 2 caracteres');
    }

    if (!this._identificacion || this._identificacion.trim() === '') {
      throw new ValidationError('Identificación del firmante es requerida');
    }
  }

  public esValida(): boolean {
    return (
      this._imagenBase64.length > 0 &&
      this._fechaHora !== undefined &&
      this._firmadoPor.length > 0
    );
  }

  public getImagenBase64(): string {
    return this._imagenBase64;
  }

  public getFirmadoPor(): string {
    return this._firmadoPor;
  }

  public getIdentificacion(): string {
    return this._identificacion;
  }

  public getFechaHora(): Date {
    return this._fechaHora;
  }

  public getIpAddress(): string | undefined {
    return this._ipAddress;
  }

  public getUserAgent(): string | undefined {
    return this._userAgent;
  }

  public toJSON(): {
    firmadoPor: string;
    identificacion: string;
    fechaHora: string;
    ipAddress?: string;
  } {
    return {
      firmadoPor: this._firmadoPor,
      identificacion: this._identificacion,
      fechaHora: this._fechaHora.toISOString(),
      ipAddress: this._ipAddress,
    };
  }
}

