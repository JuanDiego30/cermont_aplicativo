/**
 * WorkPlan Repository - Prisma Implementation
 * SQLite con JSON para arrays complejos
 * 
 * @file src/infra/db/repositories/WorkPlanRepository.ts
 */

import prisma from '../prisma.js';
import type { WorkPlan } from '@/domain/entities/WorkPlan.js';
import type { IWorkPlanRepository } from '@/domain/repositories/IWorkPlanRepository.js';

const toStringOrNull = (value: unknown): string | null => typeof value === 'string' ? value : null;

const toDateOrNull = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export class WorkPlanRepository implements IWorkPlanRepository {
  /**
   * Convertir Prisma WorkPlan a Domain WorkPlan
   */
  private toDomain(prismaWorkPlan: any): WorkPlan {
    return {
      id: prismaWorkPlan.id,
      orderId: prismaWorkPlan.orderId,
      title: prismaWorkPlan.title,
      description: prismaWorkPlan.description,
      status: prismaWorkPlan.status,
      estimatedBudget: prismaWorkPlan.estimatedBudget,
      actualBudget: prismaWorkPlan.actualBudget,
      materials: prismaWorkPlan.materials ? JSON.parse(prismaWorkPlan.materials) : [],
      tools: prismaWorkPlan.tools ? JSON.parse(prismaWorkPlan.tools) : [],
      equipment: prismaWorkPlan.equipment ? JSON.parse(prismaWorkPlan.equipment) : [],
      ppe: prismaWorkPlan.ppe ? JSON.parse(prismaWorkPlan.ppe) : [],
      asts: prismaWorkPlan.asts ? JSON.parse(prismaWorkPlan.asts) : [],  // ← AGREGAR
      checklists: prismaWorkPlan.checklists ? JSON.parse(prismaWorkPlan.checklists) : [],  // ← AGREGAR
      budgetBreakdown: prismaWorkPlan.budgetBreakdown ? JSON.parse(prismaWorkPlan.budgetBreakdown) : undefined,
      tasks: prismaWorkPlan.tasks ? JSON.parse(prismaWorkPlan.tasks) : undefined,
      attachments: prismaWorkPlan.attachments ? JSON.parse(prismaWorkPlan.attachments) : undefined,
      safetyMeetings: prismaWorkPlan.safetyMeetings ? JSON.parse(prismaWorkPlan.safetyMeetings) : undefined,
      assignedTeam: prismaWorkPlan.assignedTeam,
      plannedStart: prismaWorkPlan.plannedStart,
      plannedEnd: prismaWorkPlan.plannedEnd,
      actualStart: prismaWorkPlan.actualStart,
      actualEnd: prismaWorkPlan.actualEnd,
      notes: prismaWorkPlan.notes,
      createdBy: prismaWorkPlan.createdById,  // ← Mapear createdById a createdBy
      approvedBy: prismaWorkPlan.approvedBy,
      approvedAt: prismaWorkPlan.approvedAt,
      approvalComments: prismaWorkPlan.approvalComments ?? undefined,
      rejectedBy: prismaWorkPlan.rejectedBy,
      rejectedAt: prismaWorkPlan.rejectedAt,
      rejectionReason: prismaWorkPlan.rejectionReason,
      createdAt: prismaWorkPlan.createdAt,
      updatedAt: prismaWorkPlan.updatedAt,
    };
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<WorkPlan | null> {
    const prismaWorkPlan = await prisma.workPlan.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    return prismaWorkPlan ? this.toDomain(prismaWorkPlan) : null;
  }

  /**
   * Find by Order ID
   */
  async findByOrderId(orderId: string): Promise<WorkPlan | null> {
    const prismaWorkPlan = await prisma.workPlan.findFirst({
      where: { orderId },
      include: {
        order: true,
      },
    });

    return prismaWorkPlan ? this.toDomain(prismaWorkPlan) : null;
  }

  /**
   * Create WorkPlan
   * 
   * ✅ FIX: Casting explícito de tipos para evitar 'unknown'
   */
  async create(data: Omit<WorkPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkPlan> {
    const prismaWorkPlan = await prisma.workPlan.create({
      data: {
        orderId: data.orderId as string,                                    // ← Cast
        title: data.title as string,                                        // ← Cast
        description: (data.description as string | undefined) || '',        // ← Fix
        status: data.status as string,                                      // ← Cast
        estimatedBudget: data.estimatedBudget as number,                    // ← Cast
        actualBudget: (data.actualBudget as number | undefined) || null,    // ← Fix
        materials: data.materials ? JSON.stringify(data.materials) : null,
        tools: data.tools ? JSON.stringify(data.tools) : null,
        equipment: data.equipment ? JSON.stringify(data.equipment) : null,
        ppe: data.ppe ? JSON.stringify(data.ppe) : null,
        asts: data.asts ? JSON.stringify(data.asts) : null,  // ← AGREGAR
        checklists: data.checklists ? JSON.stringify(data.checklists) : null,  // ← AGREGAR
        budgetBreakdown: data.budgetBreakdown ? JSON.stringify(data.budgetBreakdown) : null,
        tasks: data.tasks ? JSON.stringify(data.tasks) : null,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        safetyMeetings: data.safetyMeetings ? JSON.stringify(data.safetyMeetings) : null,
        assignedTeam: data.assignedTeam ? (typeof data.assignedTeam === 'string' ? data.assignedTeam : null) : null,
        plannedStart: data.plannedStart ? (data.plannedStart instanceof Date ? data.plannedStart : null) : null,
        plannedEnd: data.plannedEnd ? (data.plannedEnd instanceof Date ? data.plannedEnd : null) : null,
        actualStart: data.actualStart ? (data.actualStart instanceof Date ? data.actualStart : null) : null,
        actualEnd: data.actualEnd ? (data.actualEnd instanceof Date ? data.actualEnd : null) : null,
        notes: data.notes ? (typeof data.notes === 'string' ? data.notes : null) : null,
        approvalComments: data.approvalComments ? (typeof data.approvalComments === 'string' ? data.approvalComments : null) : null,
        createdById: data.createdBy as string,                                // ← Usar createdById
        approvedBy: (data.approvedBy as string | undefined) || null,        // ← Fix
        approvedAt: (data.approvedAt as Date | undefined) || null,          // ← Fix
        rejectedBy: (data.rejectedBy as string | undefined) || null,        // ← Fix
        rejectedAt: (data.rejectedAt as Date | undefined) || null,          // ← Fix
        rejectionReason: (data.rejectionReason as string | undefined) || null, // ← Fix
      },
      include: {
        order: true,
      },
    });

    return this.toDomain(prismaWorkPlan);
  }

  /**
   * Update WorkPlan
   */
  async update(id: string, data: Partial<WorkPlan>): Promise<WorkPlan> {
    const updateData: any = { ...data };

    if (data.tools) updateData.tools = JSON.stringify(data.tools);
    if (data.equipment) updateData.equipment = JSON.stringify(data.equipment);
    if (data.ppe) updateData.ppe = JSON.stringify(data.ppe);
    if (data.asts) updateData.asts = JSON.stringify(data.asts);  // ← AGREGAR
    if (data.checklists) updateData.checklists = JSON.stringify(data.checklists);  // ← AGREGAR
    if (data.budgetBreakdown) updateData.budgetBreakdown = JSON.stringify(data.budgetBreakdown);
    if (data.tasks) updateData.tasks = JSON.stringify(data.tasks);
    if (data.attachments) updateData.attachments = JSON.stringify(data.attachments);
    if (data.safetyMeetings) updateData.safetyMeetings = JSON.stringify(data.safetyMeetings);
    if (data.materials) updateData.materials = JSON.stringify(data.materials);
    if ('assignedTeam' in data) updateData.assignedTeam = toStringOrNull(data.assignedTeam);
    if ('plannedStart' in data) updateData.plannedStart = toDateOrNull(data.plannedStart);
    if ('plannedEnd' in data) updateData.plannedEnd = toDateOrNull(data.plannedEnd);
    if ('actualStart' in data) updateData.actualStart = toDateOrNull(data.actualStart);
    if ('actualEnd' in data) updateData.actualEnd = toDateOrNull(data.actualEnd);
    if ('notes' in data) updateData.notes = toStringOrNull(data.notes);
    if ('approvalComments' in data) updateData.approvalComments = toStringOrNull(data.approvalComments);
    if ('approvalComments' in data) updateData.approvalComments = data.approvalComments ?? null;

    const workPlan = await prisma.workPlan.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
      },
    });

    return this.toDomain(workPlan);
  }

  /**
   * Delete WorkPlan
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.workPlan.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find all with filters
   */
  async findAll(filters?: {
    status?: string;
    orderId?: string;
    createdBy?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ workPlans: WorkPlan[]; total: number }> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.createdBy) where.createdBy = filters.createdBy;

    const [prismaWorkPlans, total] = await Promise.all([
      prisma.workPlan.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.skip || 0,
        include: {
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workPlan.count({ where }),
    ]);

    const workPlans = prismaWorkPlans.map((wp) => this.toDomain(wp));

    return { workPlans, total };
  }

  /**
   * Get stats
   */
  async getStats(): Promise<any> {
    const total = await prisma.workPlan.count();
    const byStatus: any = {};

    const statusCounts = await prisma.workPlan.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    statusCounts.forEach((item: any) => {
      byStatus[item.status] = item._count.status;
    });

    return {
      total,
      byStatus,
    };
  }

  /**
   * Find with pagination
   */
  async find(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    orderId?: string;
    createdBy?: string;  // ← Cambiar a createdBy
  }): Promise<WorkPlan[]> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.createdBy) where.createdById = filters.createdBy;  // ← Usar createdById

    const workPlans = await prisma.workPlan.findMany({
      where,
      take: filters?.limit || 50,
      skip: filters?.page ? (filters.page - 1) * (filters.limit || 50) : 0,
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return workPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Count with filters
   */
  async count(filters?: {
    status?: string;
    orderId?: string;
    createdBy?: string;  // ← Cambiar a createdBy
  }): Promise<number> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.createdBy) where.createdById = filters.createdBy;  // ← Usar createdById

    return await prisma.workPlan.count({ where });
  }

  /**
   * Approve WorkPlan
   */
  async approve(id: string, approvedBy: string, comments?: string): Promise<WorkPlan> {
    const prismaWorkPlan = await prisma.workPlan.update({
      where: { id },
      data: {
        status: 'APROBADO',
        approvedBy,
        approvedAt: new Date(),
        approvalComments: comments ?? undefined,
      },
      include: {
        order: true,
      },
    });

    return this.toDomain(prismaWorkPlan);
  }

  /**
   * Reject WorkPlan
   */
  async reject(id: string, rejectedBy: string, reason: string): Promise<WorkPlan> {
    const prismaWorkPlan = await prisma.workPlan.update({
      where: { id },
      data: {
        status: 'RECHAZADO',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
      include: {
        order: true,
      },
    });

    return this.toDomain(prismaWorkPlan);
  }

  /**
   * Add material
   */
  async addMaterial(id: string, material: any): Promise<WorkPlan> {
    const workPlan = await this.findById(id);
    if (!workPlan) throw new Error('Work plan not found');

    const materials = workPlan.materials || [];
    materials.push(material);

    return await this.update(id, { materials });
  }

  /**
   * Add checklist item
   */
  async addChecklistItem(id: string, item: any): Promise<WorkPlan> {
    const workPlan = await this.findById(id);
    if (!workPlan) throw new Error('Work plan not found');

    const checklists = workPlan.checklists || [];
    checklists.push(item);

    return await this.update(id, { checklists });
  }

  /**
   * Find by status
   */
  async findByStatus(status: string): Promise<WorkPlan[]> {
    const prismaWorkPlans = await prisma.workPlan.findMany({
      where: { status },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaWorkPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Find by creator
   */
  async findByCreator(createdBy: string): Promise<WorkPlan[]> {
    const prismaWorkPlans = await prisma.workPlan.findMany({
      where: { createdById: createdBy },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaWorkPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Find pending
   */
  async findPending(): Promise<WorkPlan[]> {
    const prismaWorkPlans = await prisma.workPlan.findMany({
      where: { status: 'PENDIENTE' },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaWorkPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Find approved
   */
  async findApproved(): Promise<WorkPlan[]> {
    const prismaWorkPlans = await prisma.workPlan.findMany({
      where: { status: 'APROBADO' },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaWorkPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Find rejected
   */
  async findRejected(): Promise<WorkPlan[]> {
    const prismaWorkPlans = await prisma.workPlan.findMany({
      where: { status: 'RECHAZADO' },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaWorkPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Find by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<WorkPlan[]> {
    const prismaWorkPlans = await prisma.workPlan.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaWorkPlans.map((wp) => this.toDomain(wp));
  }

  /**
   * Toggle checklist item
   */
  async toggleChecklistItem(id: string, index: number): Promise<WorkPlan> {
    const workPlan = await this.findById(id);
    if (!workPlan || !workPlan.checklists) {
      throw new Error('Work plan or checklists not found');
    }

    const checklists = workPlan.checklists;
    if (index >= checklists.length) {
      throw new Error('Checklist item index out of bounds');
    }

    checklists[index].completed = !checklists[index].completed;

    return await this.update(id, { checklists });
  }

  /**
   * Delete by Order ID
   */
  async deleteByOrderId(orderId: string): Promise<boolean> {
    const result = await prisma.workPlan.deleteMany({
      where: { orderId },
    });

    return result.count > 0;
  }
}

export const workPlanRepository = new WorkPlanRepository();
