/**
 * @dto SubmitFormDto
 *
 * DTO para enviar datos de un formulario completado
 */
import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EstadoFormulario {
    BORRADOR = 'borrador',
    COMPLETADO = 'completado',
    VALIDADO = 'validado',
}

export class SubmitFormDto {
    @ApiProperty({ description: 'ID del template de formulario' })
    @IsString()
    @IsNotEmpty()
    templateId!: string;

    @ApiPropertyOptional({ description: 'ID de la orden asociada (opcional)' })
    @IsOptional()
    @IsString()
    ordenId?: string;

    @ApiProperty({
        description: 'Datos del formulario completado en JSON',
        example: {
            numero_linea: '001',
            fabricante: 'Orbit',
            componentes: [
                { componente: 'Placa Superior', estado: 'C' },
            ],
        },
    })
    @IsObject()
    data!: Record<string, unknown>;

    @ApiPropertyOptional({ enum: EstadoFormulario, default: 'borrador' })
    @IsOptional()
    @IsEnum(EstadoFormulario)
    estado?: EstadoFormulario;
}

export class UpdateFormInstanceDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    data?: Record<string, unknown>;

    @ApiPropertyOptional({ enum: EstadoFormulario })
    @IsOptional()
    @IsEnum(EstadoFormulario)
    estado?: EstadoFormulario;
}
