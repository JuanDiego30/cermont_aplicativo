// ============================================
// MANTENIMIENTOS SERVICE - Cermont FSM
// Lógica de negocio para mantenimientos
// ============================================

import { prisma } from '../../config/database.js';
import { 
  CrearMantenimientoInput, 
  ActualizarMantenimientoInput,
  CompletarMantenimientoInput,
  CrearEquipoInput,
  FiltrosMantenimiento,
  EstadoMantenimiento,
  Mantenimiento,
  MantenimientoResumen,
} from './mantenimientos.types.js';

// ============================================
// SERVICIO DE MANTENIMIENTOS
// ============================================

class MantenimientosService {
  
  // ============================================
  // EQUIPOS CRUD
  // ============================================
  
  /**
   * Crear un nuevo equipo
   */
  async crearEquipo(data: CrearEquipoInput, userId: string) {
    // Verificar código único
    const existente = await prisma.equipo.findFirst({
      where: { codigo: data.codigo }
    });
    
    if (existente) {
      throw new Error(`Ya existe un equipo con el código ${data.codigo}`);
    }

    const equipo = await prisma.equipo.create({
      data: {
        ...data,
        fechaAdquisicion: data.fechaAdquisicion ? new Date(data.fechaAdquisicion) : null,
        fechaUltimoMantenimiento: data.fechaUltimoMantenimiento ? new Date(data.fechaUltimoMantenimiento) : null,
        creadoPorId: userId,
      }
    });

    return equipo;
  }

  /**
   * Obtener todos los equipos
   */
  async getEquipos(filtros?: { activo?: boolean; busqueda?: string }) {
    const where: any = {};
    
    if (filtros?.activo !== undefined) {
      where.activo = filtros.activo;
    }
    
    if (filtros?.busqueda) {
      where.OR = [
        { codigo: { contains: filtros.busqueda, mode: 'insensitive' } },
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
        { modelo: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    const equipos = await prisma.equipo.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { mantenimientos: true }
        }
      }
    });

    return equipos;
  }

  /**
   * Obtener equipo por ID
   */
  async getEquipoById(id: string) {
    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        mantenimientos: {
          orderBy: { fechaProgramada: 'desc' },
          take: 10,
        }
      }
    });

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    return equipo;
  }

  /**
   * Actualizar equipo
   */
  async actualizarEquipo(id: string, data: Partial<CrearEquipoInput>) {
    const equipo = await prisma.equipo.update({
      where: { id },
      data: {
        ...data,
        fechaAdquisicion: data.fechaAdquisicion ? new Date(data.fechaAdquisicion) : undefined,
        fechaUltimoMantenimiento: data.fechaUltimoMantenimiento ? new Date(data.fechaUltimoMantenimiento) : undefined,
      }
    });

    return equipo;
  }

  // ============================================
  // MANTENIMIENTOS CRUD
  // ============================================

  /**
   * Crear un nuevo mantenimiento
   */
  async crearMantenimiento(data: CrearMantenimientoInput, userId: string) {
    // Verificar que el equipo existe
    const equipo = await prisma.equipo.findUnique({
      where: { id: data.equipoId }
    });

    if (!equipo) {
      throw new Error('Equipo no encontrado');
    }

    const mantenimiento = await prisma.mantenimiento.create({
      data: {
        equipoId: data.equipoId,
        tipo: data.tipo,
        prioridad: data.prioridad,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fechaProgramada: new Date(data.fechaProgramada),
        tecnicoAsignadoId: data.tecnicoAsignadoId,
        estimacionHoras: data.estimacionHoras,
        notas: data.notas,
        esRecurrente: data.esRecurrente,
        frecuenciaDias: data.frecuenciaDias,
        estado: EstadoMantenimiento.PROGRAMADO,
        creadoPorId: userId,
      },
      include: {
        equipo: true,
        tecnicoAsignado: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return mantenimiento;
  }

  /**
   * Obtener mantenimientos con filtros
   */
  async getMantenimientos(filtros: FiltrosMantenimiento) {
    const { page = 1, limit = 20, ...resto } = filtros;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (resto.equipoId) where.equipoId = resto.equipoId;
    if (resto.tipo) where.tipo = resto.tipo;
    if (resto.estado) where.estado = resto.estado;
    if (resto.prioridad) where.prioridad = resto.prioridad;
    if (resto.tecnicoId) where.tecnicoAsignadoId = resto.tecnicoId;

    if (resto.fechaDesde || resto.fechaHasta) {
      where.fechaProgramada = {};
      if (resto.fechaDesde) where.fechaProgramada.gte = resto.fechaDesde;
      if (resto.fechaHasta) where.fechaProgramada.lte = resto.fechaHasta;
    }

    if (resto.busqueda) {
      where.OR = [
        { titulo: { contains: resto.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: resto.busqueda, mode: 'insensitive' } },
        { equipo: { nombre: { contains: resto.busqueda, mode: 'insensitive' } } },
      ];
    }

    const [mantenimientos, total] = await Promise.all([
      prisma.mantenimiento.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { prioridad: 'desc' },
          { fechaProgramada: 'asc' }
        ],
        include: {
          equipo: {
            select: { id: true, codigo: true, nombre: true, ubicacion: true }
          },
          tecnicoAsignado: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.mantenimiento.count({ where })
    ]);

    return {
      data: mantenimientos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtener mantenimiento por ID
   */
  async getMantenimientoById(id: string) {
    const mantenimiento = await prisma.mantenimiento.findUnique({
      where: { id },
      include: {
        equipo: true,
        tecnicoAsignado: {
          select: { id: true, name: true, email: true }
        },
        creadoPor: {
          select: { id: true, name: true }
        }
      }
    });

    if (!mantenimiento) {
      throw new Error('Mantenimiento no encontrado');
    }

    return mantenimiento;
  }

  /**
   * Actualizar mantenimiento
   */
  async actualizarMantenimiento(id: string, data: ActualizarMantenimientoInput, userId: string) {
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id },
      data: {
        ...data,
        fechaProgramada: data.fechaProgramada ? new Date(data.fechaProgramada) : undefined,
        actualizadoPorId: userId,
      },
      include: {
        equipo: true,
        tecnicoAsignado: {
          select: { id: true, name: true }
        }
      }
    });

    return mantenimiento;
  }

  /**
   * Iniciar mantenimiento
   */
  async iniciarMantenimiento(id: string, userId: string) {
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id },
      data: {
        estado: EstadoMantenimiento.EN_PROGRESO,
        fechaInicio: new Date(),
        actualizadoPorId: userId,
      }
    });

    return mantenimiento;
  }

  /**
   * Completar mantenimiento
   */
  async completarMantenimiento(id: string, data: CompletarMantenimientoInput, userId: string) {
    const mantenimientoActual = await prisma.mantenimiento.findUnique({
      where: { id },
      include: { equipo: true }
    });

    if (!mantenimientoActual) {
      throw new Error('Mantenimiento no encontrado');
    }

    // Calcular costo total
    let costoRepuestos = 0;
    if (data.repuestosUtilizados) {
      costoRepuestos = data.repuestosUtilizados.reduce(
        (acc, r) => acc + (r.cantidad * r.costoUnitario), 
        0
      );
    }
    const costoTotal = (data.costoMateriales || 0) + (data.costoManoObra || 0) + costoRepuestos;

    // Actualizar mantenimiento
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id },
      data: {
        estado: EstadoMantenimiento.COMPLETADO,
        fechaFin: new Date(),
        horasReales: data.horasReales,
        costoTotal,
        observaciones: data.observaciones,
        trabajoRealizado: data.trabajoRealizado,
        repuestosUtilizados: data.repuestosUtilizados ? JSON.stringify(data.repuestosUtilizados) : null,
        actualizadoPorId: userId,
      }
    });

    // Actualizar fecha último mantenimiento del equipo
    await prisma.equipo.update({
      where: { id: mantenimientoActual.equipoId },
      data: {
        fechaUltimoMantenimiento: new Date()
      }
    });

    // Si es recurrente, crear siguiente mantenimiento
    if (mantenimientoActual.esRecurrente && mantenimientoActual.frecuenciaDias) {
      const siguienteFecha = new Date();
      siguienteFecha.setDate(siguienteFecha.getDate() + mantenimientoActual.frecuenciaDias);

      await prisma.mantenimiento.create({
        data: {
          equipoId: mantenimientoActual.equipoId,
          tipo: mantenimientoActual.tipo,
          prioridad: mantenimientoActual.prioridad,
          titulo: mantenimientoActual.titulo,
          descripcion: mantenimientoActual.descripcion,
          fechaProgramada: siguienteFecha,
          tecnicoAsignadoId: mantenimientoActual.tecnicoAsignadoId,
          estimacionHoras: mantenimientoActual.estimacionHoras,
          esRecurrente: true,
          frecuenciaDias: mantenimientoActual.frecuenciaDias,
          estado: EstadoMantenimiento.PROGRAMADO,
          mantenimientoPadreId: id,
          creadoPorId: userId,
        }
      });
    }

    return mantenimiento;
  }

  /**
   * Cancelar mantenimiento
   */
  async cancelarMantenimiento(id: string, motivo: string, userId: string) {
    const mantenimiento = await prisma.mantenimiento.update({
      where: { id },
      data: {
        estado: EstadoMantenimiento.CANCELADO,
        observaciones: motivo,
        actualizadoPorId: userId,
      }
    });

    return mantenimiento;
  }

  // ============================================
  // DASHBOARD Y REPORTES
  // ============================================

  /**
   * Obtener resumen de mantenimientos
   */
  async getResumen(): Promise<MantenimientoResumen> {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    const en7Dias = new Date();
    en7Dias.setDate(en7Dias.getDate() + 7);

    const [programados, enProgreso, completados, pendientes, proximos, vencidos] = await Promise.all([
      prisma.mantenimiento.count({
        where: { estado: EstadoMantenimiento.PROGRAMADO }
      }),
      prisma.mantenimiento.count({
        where: { estado: EstadoMantenimiento.EN_PROGRESO }
      }),
      prisma.mantenimiento.count({
        where: { 
          estado: EstadoMantenimiento.COMPLETADO,
          fechaFin: { gte: inicioMes, lte: finMes }
        }
      }),
      prisma.mantenimiento.count({
        where: { estado: EstadoMantenimiento.PENDIENTE }
      }),
      prisma.mantenimiento.findMany({
        where: {
          estado: { in: [EstadoMantenimiento.PROGRAMADO, EstadoMantenimiento.PENDIENTE] },
          fechaProgramada: { gte: hoy, lte: en7Dias }
        },
        orderBy: { fechaProgramada: 'asc' },
        take: 5,
        include: {
          equipo: { select: { codigo: true, nombre: true } },
          tecnicoAsignado: { select: { name: true } }
        }
      }),
      prisma.mantenimiento.findMany({
        where: {
          estado: { in: [EstadoMantenimiento.PROGRAMADO, EstadoMantenimiento.PENDIENTE] },
          fechaProgramada: { lt: hoy }
        },
        orderBy: { fechaProgramada: 'asc' },
        include: {
          equipo: { select: { codigo: true, nombre: true } }
        }
      })
    ]);

    const totalProgramadosMes = programados + enProgreso + completados;
    const porcentajeCumplimiento = totalProgramadosMes > 0 
      ? Math.round((completados / totalProgramadosMes) * 100) 
      : 0;

    return {
      totalProgramados: programados,
      totalEnProgreso: enProgreso,
      totalCompletados: completados,
      totalPendientes: pendientes,
      porcentajeCumplimiento,
      proximosMantenimientos: proximos as unknown as Mantenimiento[],
      alertasVencidos: vencidos as unknown as Mantenimiento[],
    };
  }

  /**
   * Obtener calendario de mantenimientos
   */
  async getCalendario(mes: number, año: number) {
    const inicioMes = new Date(año, mes - 1, 1);
    const finMes = new Date(año, mes, 0, 23, 59, 59);

    const mantenimientos = await prisma.mantenimiento.findMany({
      where: {
        fechaProgramada: {
          gte: inicioMes,
          lte: finMes
        }
      },
      include: {
        equipo: { select: { codigo: true, nombre: true } },
        tecnicoAsignado: { select: { name: true } }
      },
      orderBy: { fechaProgramada: 'asc' }
    });

    return mantenimientos;
  }

  /**
   * Obtener historial de mantenimientos de un equipo
   */
  async getHistorialEquipo(equipoId: string) {
    const mantenimientos = await prisma.mantenimiento.findMany({
      where: { equipoId },
      orderBy: { fechaProgramada: 'desc' },
      include: {
        tecnicoAsignado: { select: { name: true } }
      }
    });

    // Estadísticas
    const completados = mantenimientos.filter(m => m.estado === EstadoMantenimiento.COMPLETADO);
    const costoTotal = completados.reduce((acc, m) => acc + (m.costoTotal || 0), 0);
    const horasTotal = completados.reduce((acc, m) => acc + (m.horasReales || 0), 0);

    return {
      mantenimientos,
      estadisticas: {
        totalMantenimientos: mantenimientos.length,
        completados: completados.length,
        costoTotal,
        horasTotal,
        costoPromedio: completados.length > 0 ? costoTotal / completados.length : 0,
      }
    };
  }

  /**
   * Detectar equipos que necesitan mantenimiento pronto
   */
  async getAlertasMantenimiento() {
    const hoy = new Date();
    
    // Equipos cuyo intervalo de mantenimiento está por vencer
    const equipos = await prisma.equipo.findMany({
      where: {
        activo: true,
        intervaloMantenimientoDias: { not: null },
        fechaUltimoMantenimiento: { not: null }
      }
    });

    const alertas = equipos.filter(equipo => {
      if (!equipo.fechaUltimoMantenimiento || !equipo.intervaloMantenimientoDias) return false;
      
      const proximoMantenimiento = new Date(equipo.fechaUltimoMantenimiento);
      proximoMantenimiento.setDate(proximoMantenimiento.getDate() + equipo.intervaloMantenimientoDias);
      
      const diasRestantes = Math.ceil((proximoMantenimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      return diasRestantes <= 7; // Alertar si faltan 7 días o menos
    }).map(equipo => {
      const proximoMantenimiento = new Date(equipo.fechaUltimoMantenimiento!);
      proximoMantenimiento.setDate(proximoMantenimiento.getDate() + equipo.intervaloMantenimientoDias!);
      
      const diasRestantes = Math.ceil((proximoMantenimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        equipo,
        proximoMantenimiento,
        diasRestantes,
        vencido: diasRestantes < 0
      };
    });

    return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }
}

export const mantenimientosService = new MantenimientosService();
