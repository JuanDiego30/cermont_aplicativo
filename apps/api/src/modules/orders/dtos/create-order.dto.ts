import { IsUUID, IsString, IsEnum, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ServiceType {
    MAINTENANCE = 'maintenance',
    INSTALLATION = 'installation',
    REPAIR = 'repair',
    INSPECTION = 'inspection',
    EMERGENCY = 'emergency'
}

export class CreateOrderDto {
    @ApiProperty({
        description: 'ID del cliente',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsUUID('4')
    clientId!: string;

    @ApiProperty({
        description: 'Tipo de servicio',
        enum: ServiceType
    })
    @IsEnum(ServiceType)
    serviceType!: ServiceType;

    @ApiProperty({
        description: 'Descripción del trabajo',
        minLength: 10,
        maxLength: 500
    })
    @IsString()
    description!: string;

    @ApiPropertyOptional({
        description: 'ID de ubicación',
        example: '550e8400-e29b-41d4-a716-446655440001'
    })
    @IsOptional()
    @IsUUID('4')
    locationId?: string;

    @ApiPropertyOptional({
        description: 'Fecha programada',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    scheduledDate?: string;

    @ApiPropertyOptional({
        description: 'Horas estimadas',
        minimum: 0.5,
        maximum: 160
    })
    @IsOptional()
    @IsNumber()
    @Min(0.5)
    @Max(160)
    estimatedHours?: number;

    @ApiPropertyOptional({
        description: 'ID del usuario asignado'
    })
    @IsOptional()
    @IsUUID('4')
    assignedTo?: string;
}
