
// Local enum definitions (matching schema.prisma)
export enum TipoMantenimiento {
    PREVENTIVO = 'PREVENTIVO',
    CORRECTIVO = 'CORRECTIVO',
    PREDICTIVO = 'PREDICTIVO',
    EMERGENCIA = 'EMERGENCIA'
}

export enum EstadoMantenimiento {
    PROGRAMADO = 'PROGRAMADO',
    EN_PROCESO = 'EN_PROCESO',
    COMPLETADO = 'COMPLETADO',
    CANCELADO = 'CANCELADO',
    PENDIENTE = 'PENDIENTE'
}

export enum PrioridadMantenimiento {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA'
}

export class Mantenimiento {
    id!: string;
    equipoId!: string;
    tipo!: TipoMantenimiento;
    estado!: EstadoMantenimiento;
    prioridad!: PrioridadMantenimiento;
    titulo!: string;
    descripcion?: string | null;
    fechaProgramada!: Date;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    tecnicoAsignadoId?: string | null;
    estimacionHoras?: number | null;
    horasReales?: number | null;
    costoTotal?: number | null;
    notas?: string | null;
    observaciones?: string | null;
    trabajoRealizado?: string | null;
    repuestosUtilizados?: string | null;
    esRecurrente!: boolean;
    frecuenciaDias?: number | null;
    mantenimientoPadreId?: string | null;
    creadoPorId?: string | null;
    actualizadoPorId?: string | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(partial: Partial<Mantenimiento>) {
        Object.assign(this, partial);
    }
}
