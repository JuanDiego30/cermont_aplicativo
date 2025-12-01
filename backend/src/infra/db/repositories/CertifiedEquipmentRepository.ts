/**
 * Repository Implementation: CertifiedEquipmentRepository
 * Implementación con Prisma para equipos certificados
 * 
 * @file backend/src/infra/db/repositories/CertifiedEquipmentRepository.ts
 */

import type {
  CertifiedEquipment,
  CreateCertifiedEquipmentDTO,
  UpdateCertifiedEquipmentDTO,
  EquipmentCategory,
  Certification,
  MaintenanceSchedule,
} from '../../../domain/entities/CertifiedEquipment.js';
import { EquipmentStatus } from '../../../domain/entities/CertifiedEquipment.js';
import type {
  ICertifiedEquipmentRepository,
  EquipmentFilters,
  PaginatedResult,
} from '../../../domain/repositories/ICertifiedEquipmentRepository.js';
import { prisma } from '../prisma.js';
import { logger } from '../../../shared/utils/logger.js';

const LOG_CONTEXT = '[CertifiedEquipmentRepository]';

export class CertifiedEquipmentRepository implements ICertifiedEquipmentRepository {
  
  async create(data: CreateCertifiedEquipmentDTO): Promise<CertifiedEquipment> {
    const equipment = await prisma.certifiedEquipment.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        certification: data.certification as any,
        additionalCertifications: data.additionalCertifications as any,
        maintenanceSchedule: data.maintenanceSchedule as any,
        status: data.status ?? EquipmentStatus.AVAILABLE,
        location: data.location,
        assignedTo: data.assignedTo,
        createdBy: data.createdBy,
      },
    });

    logger.info(`${LOG_CONTEXT} Equipo creado`, { equipmentId: equipment.id, name: equipment.name });
    
    return this.mapToDomain(equipment);
  }

  async findById(id: string): Promise<CertifiedEquipment | null> {
    const equipment = await prisma.certifiedEquipment.findUnique({
      where: { id },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return equipment ? this.mapToDomain(equipment) : null;
  }

  async findAll(filters: EquipmentFilters): Promise<PaginatedResult<CertifiedEquipment>> {
    const {
      category,
      status,
      search,
      location,
      assignedTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (assignedTo) where.assignedTo = assignedTo;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, equipment] = await Promise.all([
      prisma.certifiedEquipment.count({ where }),
      prisma.certifiedEquipment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdByUser: { select: { id: true, name: true, email: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      data: equipment.map(e => this.mapToDomain(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategory(category: EquipmentCategory): Promise<CertifiedEquipment[]> {
    const equipment = await prisma.certifiedEquipment.findMany({
      where: { category },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return equipment.map(e => this.mapToDomain(e));
  }

  async findExpiringCertifications(daysAhead: number): Promise<CertifiedEquipment[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    // Prisma no soporta queries JSON directos, usamos raw SQL
    const equipment = await prisma.$queryRaw<any[]>`
      SELECT * FROM certified_equipment
      WHERE status != 'RETIRED'
      AND status != 'EXPIRED'
      AND (certification->>'expiryDate')::timestamp <= ${futureDate}
      AND (certification->>'expiryDate')::timestamp >= ${today}
      ORDER BY (certification->>'expiryDate')::timestamp ASC
    `;

    return equipment.map(e => this.mapToDomain(e));
  }

  async findExpiredCertifications(): Promise<CertifiedEquipment[]> {
    const today = new Date();

    const equipment = await prisma.$queryRaw<any[]>`
      SELECT * FROM certified_equipment
      WHERE status != 'RETIRED'
      AND (certification->>'expiryDate')::timestamp < ${today}
      ORDER BY (certification->>'expiryDate')::timestamp DESC
    `;

    return equipment.map(e => this.mapToDomain(e));
  }

  async findBySerialNumber(serialNumber: string): Promise<CertifiedEquipment | null> {
    const equipment = await prisma.certifiedEquipment.findUnique({
      where: { serialNumber },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return equipment ? this.mapToDomain(equipment) : null;
  }

  async findByAssignedUser(userId: string): Promise<CertifiedEquipment[]> {
    const equipment = await prisma.certifiedEquipment.findMany({
      where: { assignedTo: userId },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    return equipment.map(e => this.mapToDomain(e));
  }

  async findAvailableByCategory(category: EquipmentCategory): Promise<CertifiedEquipment[]> {
    const equipment = await prisma.certifiedEquipment.findMany({
      where: {
        category,
        status: 'AVAILABLE',
      },
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    });

    return equipment.map(e => this.mapToDomain(e));
  }

  async update(id: string, data: UpdateCertifiedEquipmentDTO): Promise<CertifiedEquipment> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.serialNumber !== undefined) updateData.serialNumber = data.serialNumber;
    if (data.certification !== undefined) updateData.certification = data.certification;
    if (data.additionalCertifications !== undefined) updateData.additionalCertifications = data.additionalCertifications;
    if (data.maintenanceSchedule !== undefined) updateData.maintenanceSchedule = data.maintenanceSchedule;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.lastUsedAt !== undefined) updateData.lastUsedAt = data.lastUsedAt;

    updateData.updatedAt = new Date();

    const equipment = await prisma.certifiedEquipment.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info(`${LOG_CONTEXT} Equipo actualizado`, { equipmentId: id });

    return this.mapToDomain(equipment);
  }

  async delete(id: string): Promise<void> {
    await prisma.certifiedEquipment.update({
      where: { id },
      data: {
        status: 'RETIRED',
        updatedAt: new Date(),
      },
    });

    logger.info(`${LOG_CONTEXT} Equipo retirado (soft delete)`, { equipmentId: id });
  }

  async countByStatus(): Promise<Record<EquipmentStatus, number>> {
    const counts = await prisma.certifiedEquipment.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const result: any = {
      AVAILABLE: 0,
      IN_USE: 0,
      MAINTENANCE: 0,
      EXPIRED: 0,
      RETIRED: 0,
    };

    counts.forEach(item => {
      result[item.status] = item._count.status;
    });

    return result;
  }

  async countByCategory(): Promise<Record<EquipmentCategory, number>> {
    const counts = await prisma.certifiedEquipment.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    const result: any = {
      TOOL: 0,
      EQUIPMENT: 0,
      PPE: 0,
      VEHICLE: 0,
      INSTRUMENT: 0,
    };

    counts.forEach(item => {
      result[item.category] = item._count.category;
    });

    return result;
  }

  async existsBySerialNumber(serialNumber: string): Promise<boolean> {
    const count = await prisma.certifiedEquipment.count({
      where: { serialNumber },
    });

    return count > 0;
  }

  async markAsInUse(id: string, userId: string): Promise<CertifiedEquipment> {
    return this.update(id, {
      status: EquipmentStatus.IN_USE,
      assignedTo: userId,
      lastUsedAt: new Date(),
    });
  }

  async markAsAvailable(id: string): Promise<CertifiedEquipment> {
    return this.update(id, {
      status: EquipmentStatus.AVAILABLE,
      assignedTo: null,
    });
  }

  async updateLastUsed(id: string): Promise<void> {
    await prisma.certifiedEquipment.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private mapToDomain(prismaEquipment: any): CertifiedEquipment {
    return {
      id: prismaEquipment.id,
      name: prismaEquipment.name,
      description: prismaEquipment.description,
      category: prismaEquipment.category as EquipmentCategory,
      manufacturer: prismaEquipment.manufacturer,
      model: prismaEquipment.model,
      serialNumber: prismaEquipment.serialNumber,
      certification: this.parseCertification(prismaEquipment.certification),
      additionalCertifications: prismaEquipment.additionalCertifications 
        ? (prismaEquipment.additionalCertifications as any[]).map(c => this.parseCertification(c))
        : undefined,
      maintenanceSchedule: prismaEquipment.maintenanceSchedule 
        ? this.parseMaintenanceSchedule(prismaEquipment.maintenanceSchedule)
        : undefined,
      status: prismaEquipment.status as EquipmentStatus,
      location: prismaEquipment.location,
      assignedTo: prismaEquipment.assignedTo,
      createdBy: prismaEquipment.createdBy,
      createdAt: prismaEquipment.createdAt,
      updatedAt: prismaEquipment.updatedAt,
      lastUsedAt: prismaEquipment.lastUsedAt,
    };
  }

  private parseCertification(certData: any): Certification {
    return {
      type: certData.type,
      number: certData.number,
      issueDate: new Date(certData.issueDate),
      expiryDate: new Date(certData.expiryDate),
      issuedBy: certData.issuedBy,
      documentUrl: certData.documentUrl,
      verifiedBy: certData.verifiedBy,
      verifiedAt: certData.verifiedAt ? new Date(certData.verifiedAt) : undefined,
      notes: certData.notes,
    };
  }

  private parseMaintenanceSchedule(scheduleData: any): MaintenanceSchedule {
    return {
      lastMaintenance: new Date(scheduleData.lastMaintenance),
      nextMaintenance: new Date(scheduleData.nextMaintenance),
      frequencyInDays: scheduleData.frequencyInDays,
      maintenanceType: scheduleData.maintenanceType,
      lastMaintenanceBy: scheduleData.lastMaintenanceBy,
      notes: scheduleData.notes,
    };
  }
}
