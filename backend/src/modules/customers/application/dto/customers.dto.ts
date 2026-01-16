import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * Customer type
 */
export enum CustomerType {
  PETROLERO = 'petrolero',
  INDUSTRIAL = 'industrial',
  COMERCIAL = 'comercial',
  RESIDENCIAL = 'residencial',
  GOBIERNO = 'gobierno',
  OTRO = 'otro',
}

/**
 * DTO to create customer contact
 */
export class CreateContactDto {
  @ApiProperty({ description: 'Nombre del contacto' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ description: 'Cargo del contacto' })
  @IsString()
  @IsNotEmpty()
  cargo!: string;

  @ApiProperty({ description: 'Email del contacto' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Teléfono del contacto' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Es contacto principal' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esPrincipal?: boolean;
}

/**
 * DTO to create customer location
 */
export class CreateLocationDto {
  @ApiProperty({ description: 'Nombre de la ubicación', example: 'Caño Limón' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({ description: 'Dirección' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Ciudad' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ description: 'Departamento' })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional({ description: 'Latitud' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({ description: 'Longitud' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional({ description: 'Es ubicación principal' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  esPrincipal?: boolean;
}

/**
 * DTO to create customer
 */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Razón social',
    example: 'SIERRACOL ENERGY ARAUCA LLC',
  })
  @IsString()
  @IsNotEmpty()
  razonSocial!: string;

  @ApiProperty({ description: 'NIT', example: '900.123.456-7' })
  @IsString()
  @IsNotEmpty()
  nit!: string;

  @ApiProperty({ enum: CustomerType, description: 'Tipo de cliente' })
  @IsEnum(CustomerType)
  tipoCliente!: CustomerType;

  @ApiPropertyOptional({ description: 'Dirección principal' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Teléfono principal' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email corporativo' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    type: [CreateContactDto],
    description: 'Contactos del cliente',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contactos?: CreateContactDto[];

  @ApiPropertyOptional({
    type: [CreateLocationDto],
    description: 'Ubicaciones del cliente',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  ubicaciones?: CreateLocationDto[];
}

/**
 * DTO for customer query filters
 */
export class CustomersQueryDto {
  @ApiPropertyOptional({ type: Boolean, description: 'Filtrar por activo' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  activo?: boolean;
}

/**
 * DTO for customer response
 */
export class CustomerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  razonSocial!: string;

  @ApiProperty()
  nit!: string;

  @ApiProperty()
  tipoCliente!: CustomerType;

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

export class CustomerOrderSummaryDto {
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

export class CustomerOrdersResponseDto {
  @ApiProperty()
  clienteId!: string;

  @ApiProperty()
  razonSocial!: string;

  @ApiProperty()
  totalOrdenes!: number;

  @ApiProperty({ type: [CustomerOrderSummaryDto] })
  orders!: CustomerOrderSummaryDto[];
}
