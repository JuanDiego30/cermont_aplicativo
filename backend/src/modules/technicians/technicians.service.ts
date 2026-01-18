import { Prisma } from '@/prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Define the type for user with included assignments
type TechnicianWithAssignments = Prisma.UserGetPayload<{
  include: { asignaciones: { select: { estado: true } } };
}>;

export interface TechnicianFilters {
  search?: string;
  active?: boolean;
}

@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: TechnicianFilters) {
    const where: any = { role: 'tecnico' };

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        asignaciones: {
          select: { estado: true },
        },
      },
    });

    const total = await this.prisma.user.count({ where });

    return {
      data: users.map(u => this.mapToDomain(u)),
      total,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'tecnico' },
      include: {
        asignaciones: {
          select: { estado: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Technician with ID ${id} not found`);
    }

    return this.mapToDomain(user);
  }

  async findAvailable() {
    // Logic from Repo: Active technicians
    const users = await this.prisma.user.findMany({
      where: {
        role: 'tecnico',
        active: true,
      },
      orderBy: { name: 'asc' },
      include: {
        asignaciones: {
          select: { estado: true },
        },
      },
    });

    // Filter logic from original repo: check if they have available capacity/status
    return users.map(u => this.mapToDomain(u)).filter(t => t.availability === 'available');
  }

  async changeAvailability(id: string, availability: string) {
    // Simplification: In the original entity, 'disponibilidad' was derived,
    // but usually 'active' flag controls if they receive work.
    // If the frontend sends 'available' -> active=true, if 'inactive' -> false.

    const normalized = availability?.toLowerCase();
    const isActive = normalized !== 'inactive';

    const user = await this.prisma.user.update({
      where: { id },
      data: { active: isActive },
      include: {
        asignaciones: {
          select: { estado: true },
        },
      },
    });

    return this.mapToDomain(user);
  }

  private mapToDomain(user: TechnicianWithAssignments) {
    const assignments = user.asignaciones || [];
    const activeOrders = assignments.filter(
      a => a.estado !== 'completada' && a.estado !== 'cancelada'
    ).length;
    const completedOrders = assignments.filter(a => a.estado === 'completada').length;

    // Derived availability logic from original Entity
    // If user is inactive -> 'baja'
    // If user has > 5 active orders -> 'ocupado'
    // Else -> 'disponible'
    let availability: 'available' | 'busy' | 'inactive' = 'available';
    if (!user.active) {
      availability = 'inactive';
    } else if (activeOrders >= 5) {
      // Threshold assumed from common practice or legacy
      availability = 'busy';
    }

    return {
      id: user.id,
      userId: user.id,
      name: user.name || '',
      email: user.email,
      phone: user.phone,
      availability,
      specialties: ['general'], // Default as per legacy
      activeOrders,
      completedOrders,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
