import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, Min, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EstadoOrden {
    PENDIENTE = 'PENDIENTE',
    EN_PROGRESO = 'EN_PROGRESO',
    COMPLETADA = 'COMPLETADA',
    CANCELADA = 'CANCELADA',
    ARCHIVADA = 'ARCHIVADA'
}

export enum PrioridadOrden {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    URGENTE = 'URGENTE'
}

export class CreateOrdenDto {
    @ApiProperty({
        description: 'Número único de la orden de trabajo',
        example: 'OT-2025-001'
    })
    @IsString()
    @IsNotEmpty({ message: 'El número de orden es obligatorio' })
    @MaxLength(50, { message: 'El número de orden no puede exceder 50 caracteres' })
    numeroOrden!: string;

    @ApiProperty({
        description: 'Descripción detallada del trabajo a realizar',
        example: 'Mantenimiento preventivo de bomba centrífuga'
    })
    @IsString()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
    descripcion!: string;

    @ApiProperty({
        description: 'ID del cliente solicitante',
        example: 'clm7h8i9j0'
    })
    @IsString()
    @IsNotEmpty({ message: 'El cliente es obligatorio' })
    clienteId!: string;

    @ApiPropertyOptional({
        description: 'ID del técnico asignado',
        example: 'tec1a2b3c4'
    })
    @IsString()
    @IsOptional()
    tecnicoId?: string;

    @ApiProperty({
        enum: EstadoOrden,
        default: EstadoOrden.PENDIENTE,
        description: 'Estado actual de la orden'
    })
    @IsEnum(EstadoOrden, { message: 'Estado inválido' })
    @IsOptional()
    estado?: EstadoOrden;

    @ApiProperty({
        enum: PrioridadOrden,
        default: PrioridadOrden.MEDIA,
        description: 'Nivel de prioridad de la orden'
    })
    @IsEnum(PrioridadOrden, { message: 'Prioridad inválida' })
    @IsOptional()
    prioridad?: PrioridadOrden;

    @ApiProperty({
        description: 'Fecha programada de inicio',
        example: '2025-12-30T08:00:00Z'
    })
    @IsDateString({}, { message: 'Fecha de inicio inválida' })
    @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
    fechaInicio!: string;

    @ApiPropertyOptional({
        description: 'Fecha programada de finalización',
        example: '2025-12-31T17:00:00Z'
    })
    @IsDateString({}, { message: 'Fecha de fin inválida' })
    @IsOptional()
    fechaFin?: string;

    @ApiPropertyOptional({
        description: 'Ubicación donde se realizará el trabajo',
        example: 'Pozo ABC-123, Arauca'
    })
    @IsString()
    @IsOptional()
    @MaxLength(200, { message: 'La ubicación no puede exceder 200 caracteres' })
    ubicacion?: string;

    @ApiPropertyOptional({
        description: 'Costo estimado del trabajo en COP',
        example: 1500000,
        minimum: 0
    })
    @IsNumber()
    @Min(0, { message: 'El costo estimado no puede ser negativo' })
    @IsOptional()
    costoEstimado?: number;

    @ApiPropertyOptional({
        description: 'Notas adicionales',
        example: 'Requiere coordinación con supervisor de campo'
    })
    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
    notas?: string;
}
