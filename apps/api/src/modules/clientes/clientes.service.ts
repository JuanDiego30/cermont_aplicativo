/**
 * @service ClientesService
 * @description Servicio para gestión de clientes
 * Los clientes se extraen dinámicamente del campo 'cliente' de las órdenes
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClienteResponseDto, ClienteStatsDto } from './dto/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener todos los clientes únicos de las órdenes
   */
  async findAll(): Promise<{ data: ClienteResponseDto[] }> {
    // Obtener todas las órdenes agrupadas por cliente
    const ordenes = await this.prisma.order.findMany({
      select: {
        cliente: true,
        estado: true,
      },
    });

    // Agrupar por cliente y calcular estadísticas
    const clientesMap = new Map<string, ClienteResponseDto>();

    ordenes.forEach((orden) => {
      const clienteNombre = orden.cliente;
      
      if (!clientesMap.has(clienteNombre)) {
        clientesMap.set(clienteNombre, {
          nombre: clienteNombre,
          totalOrdenes: 0,
          ordenesActivas: 0,
          ordenesCompletadas: 0,
          activo: true,
        });
      }

      const cliente = clientesMap.get(clienteNombre)!;
      cliente.totalOrdenes++;

      if (orden.estado === 'completada') {
        cliente.ordenesCompletadas++;
      } else if (['planeacion', 'ejecucion', 'pausada'].includes(orden.estado)) {
        cliente.ordenesActivas++;
      }
    });

    // Convertir Map a array y ordenar por total de órdenes
    const clientes = Array.from(clientesMap.values()).sort(
      (a, b) => b.totalOrdenes - a.totalOrdenes
    );

    return { data: clientes };
  }

  /**
   * Obtener información de un cliente específico por nombre
   */
  async findByName(nombre: string): Promise<ClienteResponseDto> {
    const ordenes = await this.prisma.order.findMany({
      where: {
        cliente: {
          equals: nombre,
          mode: 'insensitive',
        },
      },
      select: {
        estado: true,
      },
    });

    if (ordenes.length === 0) {
      throw new NotFoundException(`Cliente "${nombre}" no encontrado`);
    }

    let ordenesActivas = 0;
    let ordenesCompletadas = 0;

    ordenes.forEach((orden) => {
      if (orden.estado === 'completada') {
        ordenesCompletadas++;
      } else if (['planeacion', 'ejecucion', 'pausada'].includes(orden.estado)) {
        ordenesActivas++;
      }
    });

    return {
      nombre,
      totalOrdenes: ordenes.length,
      ordenesActivas,
      ordenesCompletadas,
      activo: ordenesActivas > 0,
    };
  }

  /**
   * Obtener estadísticas de clientes
   */
  async getStats(): Promise<ClienteStatsDto> {
    // Obtener clientes únicos
    const clientesUnicos = await this.prisma.order.groupBy({
      by: ['cliente'],
      _count: {
        cliente: true,
      },
    });

    const total = clientesUnicos.length;

    // Obtener clientes con órdenes activas (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const clientesActivos = await this.prisma.order.groupBy({
      by: ['cliente'],
      where: {
        OR: [
          {
            estado: {
              in: ['planeacion', 'ejecucion', 'pausada'],
            },
          },
          {
            createdAt: {
              gte: seisMesesAtras,
            },
          },
        ],
      },
    });

    const activos = clientesActivos.length;
    const inactivos = total - activos;

    return {
      total,
      activos,
      inactivos,
    };
  }

  /**
   * Obtener órdenes de un cliente específico
   */
  async getClienteOrdenes(nombre: string) {
    const ordenes = await this.prisma.order.findMany({
      where: {
        cliente: {
          equals: nombre,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        numero: true,
        descripcion: true,
        estado: true,
        prioridad: true,
        fechaInicio: true,
        fechaFin: true,
        createdAt: true,
      },
    });

    if (ordenes.length === 0) {
      throw new NotFoundException(`Cliente "${nombre}" no encontrado`);
    }

    return {
      cliente: nombre,
      ordenes,
    };
  }
}
