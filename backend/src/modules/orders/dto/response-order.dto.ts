import { ApiProperty } from '@nestjs/swagger';
import { EstadoOrder, PrioridadOrder } from './create-order.dto';

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  numeroOrder!: string;

  @ApiProperty()
  descripcion!: string;

  @ApiProperty()
  clienteId!: string;

  @ApiProperty({ required: false })
  tecnicoId?: string;

  @ApiProperty({ enum: EstadoOrder })
  estado!: EstadoOrder;

  @ApiProperty({ enum: PrioridadOrder })
  prioridad!: PrioridadOrder;

  @ApiProperty()
  fechaInicio!: Date;

  @ApiProperty({ required: false })
  fechaFin?: Date;

  @ApiProperty({ required: false })
  fechaRealInicio?: Date;

  @ApiProperty({ required: false })
  fechaRealFin?: Date;

  @ApiProperty({ required: false })
  ubicacion?: string;

  @ApiProperty({ required: false })
  costoEstimado?: number;

  @ApiProperty({ required: false })
  costoReal?: number;

  @ApiProperty({ required: false })
  notas?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data!: OrderResponseDto[];

  @ApiProperty({
    description: 'Información de paginación',
    example: {
      total: 150,
      page: 1,
      limit: 10,
      totalPages: 15,
    },
  })
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
