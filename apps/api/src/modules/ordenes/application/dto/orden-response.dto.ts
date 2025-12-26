import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrdenPrioridad } from './create-orden.dto';
import { OrdenEstado } from './update-orden.dto';

// Re-export para facilitar imports
export { OrdenEstado } from './update-orden.dto';
export { OrdenPrioridad } from './create-orden.dto';

export class OrdenResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'ORD-2024-001' })
  numero!: string;

  @ApiProperty({ example: 'Mantenimiento preventivo - Torre 5G' })
  descripcion!: string;

  @ApiProperty({ example: 'Ecopetrol S.A.' })
  cliente!: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  contactoCliente?: string;

  @ApiPropertyOptional({ example: '+57 300 123 4567' })
  telefonoCliente?: string;

  @ApiPropertyOptional({ example: 'Carrera 15 #45-67, Bogotá' })
  direccion?: string;

  @ApiProperty({ enum: OrdenEstado })
  estado!: OrdenEstado;

  @ApiProperty({ enum: OrdenPrioridad })
  prioridad!: OrdenPrioridad;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creadorId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  asignadoId?: string;

  @ApiPropertyOptional({ example: '2025-03-15T08:00:00.000Z' })
  fechaInicio?: Date;

  @ApiPropertyOptional({ example: '2025-03-15T17:00:00.000Z' })
  fechaFin?: Date;

  @ApiPropertyOptional({ example: '2025-03-15T17:00:00.000Z' })
  fechaFinEstimada?: Date;

  @ApiPropertyOptional({ example: 250000 })
  presupuestoEstimado?: number;

  @ApiPropertyOptional({ example: 245000 })
  costoReal?: number;

  @ApiPropertyOptional({ example: 'Observaciones generales' })
  observaciones?: string;

  @ApiPropertyOptional({ example: true })
  requiereHES?: boolean;

  @ApiPropertyOptional({ example: false })
  cumplimientoHES?: boolean;

  @ApiProperty({ example: '2024-12-24T18:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-12-24T18:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: { id: '123', name: 'Usuario Creador' } })
  creador?: { id: string; name: string };

  @ApiPropertyOptional({ example: { id: '456', name: 'Técnico Asignado' } })
  asignado?: { id: string; name: string };
}

export class PaginatedOrdenResponseDto {
  @ApiProperty({ type: [OrdenResponseDto] })
  data!: OrdenResponseDto[];

  @ApiProperty({ example: 150 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 15 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNextPage!: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage!: boolean;
}

export class HistorialEstadoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'ORD-2024-001' })
  ordenId!: string;

  @ApiPropertyOptional({ enum: OrdenEstado, example: OrdenEstado.PLANEACION })
  estadoAnterior?: OrdenEstado;

  @ApiProperty({ enum: OrdenEstado, example: OrdenEstado.EJECUCION })
  estadoNuevo!: OrdenEstado;

  @ApiProperty({ example: 'Técnico asignado' })
  motivo!: string;

  @ApiPropertyOptional({ example: 'Observaciones del cambio' })
  observaciones?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174002' })
  usuarioId?: string;

  @ApiProperty({ example: '2024-12-24T18:00:00.000Z' })
  createdAt!: Date;
}

