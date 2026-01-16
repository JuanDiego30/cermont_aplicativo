/**
 * Common Types - Shared between Backend and Frontend
 */

/** UUID string type for strict typing */
export type UUID = string;

/** ISO date string */
export type ISODateString = string;

/** Generic ID type */
export type EntityId = UUID;

/** Nullable type helper */
export type Nullable<T> = T | null;

/** Optional type helper (converts null to undefined) */
export type Optional<T> = T | undefined;

/** Deep partial type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Base entity interface */
export interface BaseEntity {
  id: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Soft deletable entity */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: ISODateString;
  isDeleted: boolean;
}

/** Audit fields for tracking changes */
export interface AuditFields {
  createdBy?: EntityId;
  updatedBy?: EntityId;
  deletedBy?: EntityId;
}

/** Coordinates for geolocation */
export interface Coordinates {
  latitud: number;
  longitud: number;
}

/** Address structure */
export interface Address {
  direccion: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  codigoPostal?: string;
  coordinates?: Coordinates;
}

/** Contact information */
export interface ContactInfo {
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  esPrincipal: boolean;
}

/** Money value (use with caution - prefer backend Money VO) */
export interface MoneyValue {
  amount: string; // String to preserve precision
  currency: 'COP' | 'USD' | 'EUR';
}

/** Date range for filters */
export interface DateRange {
  from: ISODateString;
  to: ISODateString;
}
