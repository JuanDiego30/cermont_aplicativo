/**
 * Entity: ClienteInfo
 *
 * Información del cliente para la HES
 */

import { ValidationError } from "../../../../common/domain/exceptions";
import { Telefono } from "../value-objects/telefono.vo";
import { Direccion } from "../value-objects/direccion.vo";
import { CoordenadasGPS } from "../value-objects/coordenadas-gps.vo";
import { Email } from "../../../../common/domain/value-objects/email.vo";

export interface CreateClienteInfoProps {
  nombre: string;
  identificacion: string;
  telefono: string;
  email?: string;
  direccion: {
    calle: string;
    numero?: string;
    barrio?: string;
    ciudad: string;
    departamento?: string;
    pais?: string;
    codigoPostal?: string;
  };
  coordenadasGPS?: {
    latitud: number;
    longitud: number;
  };
}

export class ClienteInfo {
  private constructor(
    private readonly _nombre: string,
    private readonly _identificacion: string,
    private readonly _telefono: Telefono,
    private readonly _direccion: Direccion,
    private readonly _email?: Email,
    private readonly _coordenadasGPS?: CoordenadasGPS,
  ) {}

  public static create(props: CreateClienteInfoProps): ClienteInfo {
    const info = new ClienteInfo(
      props.nombre,
      props.identificacion,
      Telefono.create(props.telefono),
      Direccion.create(props.direccion),
      props.email ? Email.create(props.email) : undefined,
      props.coordenadasGPS
        ? CoordenadasGPS.create(
            props.coordenadasGPS.latitud,
            props.coordenadasGPS.longitud,
          )
        : undefined,
    );

    info.validate();
    return info;
  }

  private validate(): void {
    if (!this._nombre || this._nombre.trim() === "") {
      throw new ValidationError("Nombre del cliente es requerido");
    }

    if (this._nombre.length < 2) {
      throw new ValidationError(
        "Nombre del cliente debe tener al menos 2 caracteres",
      );
    }

    if (!this._identificacion || this._identificacion.trim() === "") {
      throw new ValidationError("Identificación del cliente es requerida");
    }

    if (this._identificacion.length < 5) {
      throw new ValidationError(
        "Identificación del cliente debe tener al menos 5 caracteres",
      );
    }
  }

  public getNombre(): string {
    return this._nombre;
  }

  public getIdentificacion(): string {
    return this._identificacion;
  }

  public getTelefono(): string {
    return this._telefono.getValue();
  }

  public getEmail(): string | undefined {
    return this._email?.getValue();
  }

  public getDireccionCompleta(): string {
    return this._direccion.toString();
  }

  public tieneCoordenadasGPS(): boolean {
    return this._coordenadasGPS !== undefined;
  }

  public getCoordenadasGPS(): { lat: number; lon: number } | undefined {
    return this._coordenadasGPS?.toJSON();
  }
}
