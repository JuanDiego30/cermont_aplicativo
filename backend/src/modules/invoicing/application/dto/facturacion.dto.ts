import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Estado de SES Ariba
 */
export enum EstadoSES {
  PENDIENTE = 'PENDIENTE',
  GENERADO = 'GENERADO',
  ENVIADO = 'ENVIADO',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

/**
 * Estado de Factura
 */
export enum EstadoFactura {
  PENDIENTE = 'PENDIENTE',
  GENERADA = 'GENERADA',
  ENVIADA = 'ENVIADA',
  APROBADA = 'APROBADA',
  PAGADA = 'PAGADA',
  RECHAZADA = 'RECHAZADA',
}

/**
 * DTO para registrar SES
 */
export class RegistrarSESDto {
  @ApiProperty({ description: 'ID de la orden' })
  @IsString()
  @IsNotEmpty()
  ordenId!: string;

  @ApiProperty({
    description: 'Número de SES en Ariba',
    example: 'SES-2024-001234',
  })
  @IsString()
  @IsNotEmpty()
  numeroSES!: string;

  @ApiProperty({ description: 'Monto del SES' })
  @Type(() => Number)
  @IsNumber()
  monto!: number;

  @ApiPropertyOptional({ description: 'Fecha de generación' })
  @IsOptional()
  @IsDateString()
  fechaGeneracion?: string;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/**
 * DTO para aprobar SES
 */
export class AprobarSESDto {
  @ApiProperty({ description: 'ID del SES' })
  @IsString()
  @IsNotEmpty()
  sesId!: string;

  @ApiPropertyOptional({ description: 'Fecha de aprobación' })
  @IsOptional()
  @IsDateString()
  fechaAprobacion?: string;

  @ApiPropertyOptional({ description: 'Número de aprobación en Ariba' })
  @IsOptional()
  @IsString()
  numeroAprobacion?: string;
}

/**
 * DTO para generar factura
 */
export class GenerarFacturaDto {
  @ApiProperty({ description: 'ID del SES aprobado' })
  @IsString()
  @IsNotEmpty()
  sesId!: string;

  @ApiProperty({ description: 'Número de factura', example: 'FAC-2024-001234' })
  @IsString()
  @IsNotEmpty()
  numeroFactura!: string;

  @ApiProperty({ description: 'Monto de la factura' })
  @Type(() => Number)
  @IsNumber()
  monto!: number;

  @ApiPropertyOptional({ description: 'Monto IVA' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montoIVA?: number;

  @ApiPropertyOptional({ description: 'Fecha de emisión' })
  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento' })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}

/**
 * DTO para registrar pago
 */
export class RegistrarPagoDto {
  @ApiProperty({ description: 'ID de la factura' })
  @IsString()
  @IsNotEmpty()
  facturaId!: string;

  @ApiProperty({ description: 'Monto pagado' })
  @Type(() => Number)
  @IsNumber()
  montoPagado!: number;

  @ApiPropertyOptional({ description: 'Fecha de pago' })
  @IsOptional()
  @IsDateString()
  fechaPago?: string;

  @ApiPropertyOptional({ description: 'Referencia de pago' })
  @IsOptional()
  @IsString()
  referenciaPago?: string;
}

/**
 * DTO de respuesta de SES
 */
export class SESResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  ordenId!: string;

  @ApiProperty()
  numeroOrden!: string;

  @ApiProperty()
  numeroSES!: string;

  @ApiProperty()
  monto!: number;

  @ApiProperty({ enum: EstadoSES })
  estado!: EstadoSES;

  @ApiPropertyOptional()
  fechaGeneracion?: string;

  @ApiPropertyOptional()
  fechaEnvio?: string;

  @ApiPropertyOptional()
  fechaAprobacion?: string;

  @ApiPropertyOptional()
  numeroAprobacion?: string;

  @ApiPropertyOptional()
  observaciones?: string;

  @ApiProperty()
  diasPendiente!: number;

  @ApiPropertyOptional()
  alertLevel?: 'INFO' | 'WARNING' | 'CRITICAL';
}

/**
 * DTO de respuesta de factura
 */
export class FacturaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sesId!: string;

  @ApiProperty()
  numeroFactura!: string;

  @ApiProperty()
  monto!: number;

  @ApiPropertyOptional()
  montoIVA?: number;

  @ApiProperty()
  montoTotal!: number;

  @ApiProperty({ enum: EstadoFactura })
  estado!: EstadoFactura;

  @ApiPropertyOptional()
  fechaEmision?: string;

  @ApiPropertyOptional()
  fechaVencimiento?: string;

  @ApiPropertyOptional()
  fechaPago?: string;

  @ApiPropertyOptional()
  montoPagado?: number;

  @ApiPropertyOptional()
  referenciaPago?: string;

  @ApiProperty()
  diasPendiente!: number;

  @ApiPropertyOptional()
  alertLevel?: 'INFO' | 'WARNING' | 'CRITICAL';
}

/**
 * DTO resumen de facturación
 */
export class ResumenFacturacionDto {
  @ApiProperty()
  totalPendienteSES!: number;

  @ApiProperty()
  totalPendienteFacturacion!: number;

  @ApiProperty()
  totalPendientePago!: number;

  @ApiProperty()
  totalFacturado!: number;

  @ApiProperty()
  totalPagado!: number;

  @ApiProperty({ type: [SESResponseDto] })
  sesPendientes!: SESResponseDto[];

  @ApiProperty({ type: [FacturaResponseDto] })
  facturasPendientes!: FacturaResponseDto[];

  @ApiProperty()
  alertas!: Array<{
    tipo: string;
    mensaje: string;
    nivel: string;
    relacionadoId: string;
  }>;
}
