/**
 * @file cliente.dto.ts
 * @description DTOs para el módulo de clientes
 * Los clientes se extraen de las órdenes de trabajo
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ description: 'NIT del cliente' })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del cliente' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Dirección del cliente' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Estado activo del cliente', default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateClienteDto {
  @ApiPropertyOptional({ description: 'Nombre del cliente' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ description: 'NIT del cliente' })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del cliente' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ description: 'Dirección del cliente' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ description: 'Estado activo del cliente' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class ClienteResponseDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  nombre!: string;

  @ApiProperty({ description: 'Número de órdenes del cliente' })
  totalOrdenes!: number;

  @ApiProperty({ description: 'Órdenes activas' })
  ordenesActivas!: number;

  @ApiProperty({ description: 'Órdenes completadas' })
  ordenesCompletadas!: number;

  @ApiProperty({ description: 'Estado del cliente' })
  activo!: boolean;
}

export class ClienteStatsDto {
  @ApiProperty({ description: 'Total de clientes únicos' })
  total!: number;

  @ApiProperty({ description: 'Clientes activos (con órdenes recientes)' })
  activos!: number;

  @ApiProperty({ description: 'Clientes inactivos' })
  inactivos!: number;
}
