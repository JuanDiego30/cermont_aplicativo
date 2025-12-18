import { IsEmail, IsString, IsArray, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: Enviar Email
 * Valida datos de entrada para envío de emails
 */
export class SendEmailDto {
    @ApiProperty({
        description: 'Email del remitente',
        example: 'noreply@cermont.com',
    })
    @IsEmail()
    from!: string;

    @ApiProperty({
        description: 'Lista de emails destinatarios',
        example: ['cliente@example.com'],
        type: [String],
    })
    @IsArray()
    @IsEmail({}, { each: true })
    to!: string[];

    @ApiProperty({
        description: 'Asunto del email',
        example: 'Orden de trabajo #1234 creada',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    subject!: string;

    @ApiProperty({
        description: 'Cuerpo del email en texto plano',
        example: 'Su orden de trabajo ha sido creada exitosamente.',
        required: false,
    })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiProperty({
        description: 'Cuerpo del email en HTML',
        example: '<p>Su orden de trabajo ha sido <strong>creada</strong>.</p>',
        required: false,
    })
    @IsOptional()
    @IsString()
    html?: string;
}
