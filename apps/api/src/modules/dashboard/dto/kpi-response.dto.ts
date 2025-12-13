/**
 * @dto KPI Response DTOs
 * 
 * DTOs para respuestas del dashboard y KPIs.
 * Uso: Validar y documentar respuestas de endpoints de métricas.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    IsEnum,
    IsArray,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// ENUMS
// ============================================

export enum AlertaTipo {
    SOBRECOSTO = 'SOBRECOSTO',
    RETRASO = 'RETRASO',
    INCUMPLIMIENTO = 'INCUMPLIMIENTO',
    CUELLO_BOTELLA = 'CUELLO_BOTELLA',
    VENCIMIENTO_PROXIMO = 'VENCIMIENTO_PROXIMO',
}

export enum AlertaSeveridad {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA',
}

export enum Granularidad {
    DIA = 'DIA',
    SEMANA = 'SEMANA',
    MES = 'MES',
}

// ============================================
// NESTED DTOs
// ============================================

export class KpiOverviewDto {
    @ApiProperty({ example: 45, description: 'Total de órdenes' })
    @IsNumber()
    ordenes_totales!: number;

    @ApiProperty({ example: 42, description: 'Órdenes completadas' })
    @IsNumber()
    ordenes_completadas!: number;

    @ApiProperty({ example: 2, description: 'Órdenes en progreso' })
    @IsNumber()
    ordenes_en_progreso!: number;

    @ApiProperty({ example: 1, description: 'Órdenes en planeación' })
    @IsNumber()
    ordenes_en_planeacion!: number;

    @ApiProperty({ example: 93.3, description: 'Tasa de cumplimiento (%)' })
    @IsNumber()
    tasa_cumplimiento!: number;

    @ApiProperty({ example: 18.5, description: 'Tiempo promedio de ciclo (horas)' })
    @IsNumber()
    tiempo_promedio_ciclo!: number;

    @ApiProperty({ example: 3.2, description: 'Promedio de días para completar' })
    @IsNumber()
    promedio_dias_completar!: number;
}

export class KpiCostosDto {
    @ApiProperty({ example: 2500000, description: 'Presupuesto total estimado' })
    @IsNumber()
    presupuestado_total!: number;

    @ApiProperty({ example: 2380000, description: 'Costo real total' })
    @IsNumber()
    costo_real_total!: number;

    @ApiProperty({ example: -4.8, description: 'Desviación porcentual' })
    @IsNumber()
    desviacion_porcentaje!: number;

    @ApiProperty({ example: 452200, description: 'Total de impuestos' })
    @IsNumber()
    impuestos_total!: number;

    @ApiProperty({ example: 12.5, description: 'Margen de utilidad (%)' })
    @IsNumber()
    margen_utilidad!: number;

    @ApiProperty({ example: 2832200, description: 'Total facturado' })
    @IsNumber()
    facturado_total!: number;

    @ApiProperty({ example: 150000, description: 'Pendiente por facturar' })
    @IsNumber()
    pendiente_facturar!: number;
}

export class KpiTecnicosDto {
    @ApiProperty({ example: 8, description: 'Técnicos activos' })
    @IsNumber()
    tecnicos_activos!: number;

    @ApiProperty({ example: 5, description: 'Técnicos con órdenes asignadas' })
    @IsNumber()
    tecnicos_ocupados!: number;

    @ApiProperty({ example: 5.6, description: 'Promedio de órdenes por técnico' })
    @IsNumber()
    promedio_ordenes_por_tecnico!: number;

    @ApiPropertyOptional({
        description: 'Técnico con más órdenes completadas',
        example: { id: 'uuid', nombre: 'Juan Pérez', ordenes_completadas: 15 },
    })
    top_tecnico?: {
        id: string;
        nombre: string;
        ordenes_completadas: number;
    };
}

export class AlertaDto {
    @ApiProperty({ enum: AlertaTipo, example: 'SOBRECOSTO' })
    @IsEnum(AlertaTipo)
    tipo!: AlertaTipo;

    @ApiProperty({ example: 'uuid-orden-123' })
    @IsString()
    entidad_id!: string;

    @ApiProperty({ example: 'ORDEN' })
    @IsString()
    entidad_tipo!: 'ORDEN' | 'USUARIO' | 'GLOBAL';

    @ApiProperty({ example: 'Orden XXX 5% sobre presupuesto' })
    @IsString()
    mensaje!: string;

    @ApiProperty({ enum: AlertaSeveridad, example: 'MEDIA' })
    @IsEnum(AlertaSeveridad)
    severidad!: AlertaSeveridad;

    @ApiPropertyOptional({ description: 'Datos adicionales' })
    metadata?: Record<string, unknown>;

    @ApiProperty({ example: '2024-12-13T10:42:00Z' })
    @IsDateString()
    timestamp!: string;
}

// ============================================
// MAIN RESPONSE DTOs
// ============================================

export class KpiMetricsResponseDto {
    @ApiProperty({ type: KpiOverviewDto })
    @ValidateNested()
    @Type(() => KpiOverviewDto)
    overview!: KpiOverviewDto;

    @ApiProperty({ type: KpiCostosDto })
    @ValidateNested()
    @Type(() => KpiCostosDto)
    costos!: KpiCostosDto;

    @ApiProperty({ type: KpiTecnicosDto })
    @ValidateNested()
    @Type(() => KpiTecnicosDto)
    tecnicos!: KpiTecnicosDto;

    @ApiProperty({ type: [AlertaDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AlertaDto)
    alertas!: AlertaDto[];

    @ApiProperty({ example: '2024-12-13T10:42:00Z' })
    @IsDateString()
    timestamp!: string;
}

// ============================================
// REQUEST DTOs
// ============================================

export class GetKpisByPeriodDto {
    @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha desde' })
    @IsOptional()
    @IsDateString()
    desde?: string;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha hasta' })
    @IsOptional()
    @IsDateString()
    hasta?: string;
}

export class GetTendenciasDto {
    @ApiProperty({ example: '2024-01-01', description: 'Fecha desde' })
    @IsDateString()
    desde!: string;

    @ApiProperty({ example: '2024-12-31', description: 'Fecha hasta' })
    @IsDateString()
    hasta!: string;

    @ApiPropertyOptional({ enum: Granularidad, example: 'MES' })
    @IsOptional()
    @IsEnum(Granularidad)
    granularidad?: Granularidad;
}

export class CostoDesglosadoDto {
    @ApiProperty({ example: 'uuid-orden' })
    @IsString()
    orden_id!: string;

    @ApiProperty({ example: 'OT-2024-001' })
    @IsString()
    numero_orden!: string;

    @ApiProperty({ example: 'ECOPETROL' })
    @IsString()
    cliente!: string;

    @ApiProperty({ example: 500000 })
    @IsNumber()
    presupuesto!: number;

    @ApiProperty({ example: 480000 })
    @IsNumber()
    costo_real!: number;

    @ApiProperty({
        description: 'Desglose por tipo de costo',
        example: {
            mano_obra: 200000,
            materiales: 150000,
            equipos: 80000,
            transporte: 30000,
            otros: 20000,
        },
    })
    desglose!: {
        mano_obra: number;
        materiales: number;
        equipos: number;
        transporte: number;
        otros: number;
    };

    @ApiProperty({ example: -4.0 })
    @IsNumber()
    desviacion!: number;

    @ApiProperty({ example: 'completada' })
    @IsString()
    estado!: string;
}
