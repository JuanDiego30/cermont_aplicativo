import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Tipo de cliente
 */
export enum TipoCliente {
  PETROLERO = "PETROLERO",
  INDUSTRIAL = "INDUSTRIAL",
  COMERCIAL = "COMERCIAL",
  GOBIERNO = "GOBIERNO",
}

/**
 * DTO para crear contacto de cliente
 */
export class CreateContactoDto {
  @ApiProperty({ description: "Nombre del contacto" })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ description: "Cargo del contacto" })
  @IsString()
  @IsNotEmpty()
  cargo!: string;

  @ApiProperty({ description: "Email del contacto" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: "Teléfono del contacto" })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: "Es contacto principal" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esPrincipal?: boolean;
}

/**
 * DTO para crear ubicación de cliente
 */
export class CreateUbicacionDto {
  @ApiProperty({ description: "Nombre de la ubicación", example: "Caño Limón" })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({ description: "Dirección" })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: "Ciudad" })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ description: "Departamento" })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional({ description: "Latitud" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({ description: "Longitud" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({ description: "Es ubicación principal" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esPrincipal?: boolean;
}

/**
 * DTO para crear cliente
 */
export class CreateClienteDto {
  @ApiProperty({
    description: "Razón social",
    example: "SIERRACOL ENERGY ARAUCA LLC",
  })
  @IsString()
  @IsNotEmpty()
  razonSocial!: string;

  @ApiProperty({ description: "NIT", example: "900.123.456-7" })
  @IsString()
  @IsNotEmpty()
  nit!: string;

  @ApiProperty({ enum: TipoCliente, description: "Tipo de cliente" })
  @IsEnum(TipoCliente)
  tipoCliente!: TipoCliente;

  @ApiPropertyOptional({ description: "Dirección principal" })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: "Teléfono principal" })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: "Email corporativo" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    type: [CreateContactoDto],
    description: "Contactos del cliente",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactoDto)
  contactos?: CreateContactoDto[];

  @ApiPropertyOptional({
    type: [CreateUbicacionDto],
    description: "Ubicaciones del cliente",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUbicacionDto)
  ubicaciones?: CreateUbicacionDto[];
}

/**
 * DTO para filtros de consulta de clientes
 */
export class ClientesQueryDto {
  @ApiPropertyOptional({ type: Boolean, description: "Filtrar por activo" })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  activo?: boolean;
}

/**
 * DTO de respuesta de cliente
 */
export class ClienteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  razonSocial!: string;

  @ApiProperty()
  nit!: string;

  @ApiProperty()
  tipoCliente!: TipoCliente;

  @ApiPropertyOptional()
  direccion?: string;

  @ApiPropertyOptional()
  telefono?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty()
  activo!: boolean;

  @ApiProperty({ type: [Object] })
  contactos!: Array<{
    id: string;
    nombre: string;
    cargo: string;
    email: string;
    telefono?: string;
    esPrincipal: boolean;
  }>;

  @ApiProperty({ type: [Object] })
  ubicaciones!: Array<{
    id: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
    departamento?: string;
    latitud?: number;
    longitud?: number;
    esPrincipal: boolean;
  }>;

  @ApiProperty()
  totalOrdenes!: number;

  @ApiProperty()
  createdAt!: string;
}

export class ClienteOrdenResumenDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  numero!: string;

  @ApiProperty()
  descripcion!: string;

  @ApiProperty()
  estado!: string;

  @ApiProperty()
  prioridad!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  fechaFin?: Date | null;
}

export class ClienteOrdenesResponseDto {
  @ApiProperty()
  clienteId!: string;

  @ApiProperty()
  razonSocial!: string;

  @ApiProperty()
  totalOrdenes!: number;

  @ApiProperty({ type: [ClienteOrdenResumenDto] })
  ordenes!: ClienteOrdenResumenDto[];
}
