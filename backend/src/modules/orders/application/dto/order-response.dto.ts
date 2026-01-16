import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridad as OrderPrioridad } from './create-order.dto';
import { Orderstado } from './update-order.dto';

// Re-export para facilitar imports
export { Prioridad as OrderPrioridad } from './create-order.dto';
export { Orderstado } from './update-order.dto';

export class OrderResponseDto {
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

  @ApiProperty({ enum: Orderstado })
  estado!: Orderstado;

  @ApiProperty({ enum: OrderPrioridad })
  prioridad!: OrderPrioridad;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creadorId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  asignadoId?: string;

  @ApiPropertyOptional({ example: '2025-03-15T08:00:00.000Z' })
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2025-03-15T17:00:00.000Z' })
  fechaFin?: string;

  @ApiPropertyOptional({ example: '2025-03-15T17:00:00.000Z' })
  fechaFinEstimada?: string;

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
  createdAt!: string;

  @ApiProperty({ example: '2024-12-24T18:00:00.000Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ example: { id: '123', name: 'Usuario Creador' } })
  creador?: { id: string; name: string };

  @ApiPropertyOptional({ example: { id: '456', name: 'Técnico Asignado' } })
  asignado?: { id: string; name: string };
}

export class PaginatedOrderResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data!: OrderResponseDto[];

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
  OrderId!: string;

  @ApiPropertyOptional({ enum: Orderstado, example: Orderstado.PLANEACION })
  estadoAnterior?: Orderstado;

  @ApiProperty({ enum: Orderstado, example: Orderstado.EJECUCION })
  estadoNuevo!: Orderstado;

  @ApiProperty({ example: 'Técnico asignado' })
  motivo!: string;

  @ApiPropertyOptional({ example: 'Observaciones del cambio' })
  observaciones?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174002' })
  usuarioId?: string;

  @ApiProperty({ example: '2024-12-24T18:00:00.000Z' })
  createdAt!: string;
}
