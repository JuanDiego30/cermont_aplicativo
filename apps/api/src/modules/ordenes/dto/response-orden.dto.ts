import { ApiProperty } from '@nestjs/swagger';
import { EstadoOrden, PrioridadOrden } from './create-orden.dto';

export class OrdenResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    numeroOrden!: string;

    @ApiProperty()
    descripcion!: string;

    @ApiProperty()
    clienteId!: string;

    @ApiProperty({ required: false })
    tecnicoId?: string;

    @ApiProperty({ enum: EstadoOrden })
    estado!: EstadoOrden;

    @ApiProperty({ enum: PrioridadOrden })
    prioridad!: PrioridadOrden;

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

export class PaginationMeta {
    @ApiProperty({ example: 150 })
    total!: number;

    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    limit!: number;

    @ApiProperty({ example: 15 })
    totalPages!: number;
}

export class PaginatedOrdenesResponseDto {
    @ApiProperty({ type: [OrdenResponseDto] })
    data!: OrdenResponseDto[];

    @ApiProperty({ type: PaginationMeta })
    meta!: PaginationMeta;
}
