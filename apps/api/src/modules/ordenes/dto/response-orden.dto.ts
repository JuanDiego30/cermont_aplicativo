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

export class PaginatedOrdenesResponseDto {
    @ApiProperty({ type: [OrdenResponseDto] })
    data!: OrdenResponseDto[];

    @ApiProperty({
        description: 'Información de paginación',
        example: {
            total: 150,
            page: 1,
            limit: 10,
            totalPages: 15
        }
    })
    meta!: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
