import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js'; // Asegúrate de exportar este enum
import type {
  IWorkPlanRepository,
  WorkPlanFilters,
  PaginationParams,
  SortingParams
} from '../../../domain/repositories/IWorkPlanRepository.js';

// Helpers
const parseJSON = (val: string | null): any[] => (val ? JSON.parse(val) : []);
const stringifyJSON = (val: any[] | undefined): string | null => (val?.length ? JSON.stringify(val) : null);

export class WorkPlanRepository implements IWorkPlanRepository {

  private toDomain(prismaWorkPlan: any): WorkPlan {
    return {
      id: prismaWorkPlan.id,
      orderId: prismaWorkPlan.orderId,
      status: prismaWorkPlan.status as WorkPlanStatus,
      estimatedBudget: prismaWorkPlan.estimatedBudget,

      // Arrays JSON
      materials: parseJSON(prismaWorkPlan.materials),
      tools: parseJSON(prismaWorkPlan.tools),
      equipment: parseJSON(prismaWorkPlan.equipment),
      ppe: parseJSON(prismaWorkPlan.ppe),
      asts: parseJSON(prismaWorkPlan.asts),
      checklists: parseJSON(prismaWorkPlan.checklists),
      budgetBreakdown: parseJSON(prismaWorkPlan.budgetBreakdown),
      tasks: parseJSON(prismaWorkPlan.tasks),
      attachments: parseJSON(prismaWorkPlan.attachments),
      safetyMeetings: parseJSON(prismaWorkPlan.safetyMeetings),

      assignedTeam: prismaWorkPlan.assignedTeam 
        ? (typeof prismaWorkPlan.assignedTeam === 'string' 
            ? JSON.parse(prismaWorkPlan.assignedTeam) 
            : prismaWorkPlan.assignedTeam)
        : [], // Si es array
      notes: prismaWorkPlan.notes,
      createdBy: prismaWorkPlan.createdById, // Mapear de Prisma createdById a dominio createdBy
      createdAt: prismaWorkPlan.createdAt,
      updatedAt: prismaWorkPlan.updatedAt,

      // Objetos compuestos
      plannedWindow: (prismaWorkPlan.plannedStart && prismaWorkPlan.plannedEnd)
        ? { start: prismaWorkPlan.plannedStart, end: prismaWorkPlan.plannedEnd }
        : undefined,

      actualWindow: (prismaWorkPlan.actualStart && prismaWorkPlan.actualEnd)
        ? { start: prismaWorkPlan.actualStart, end: prismaWorkPlan.actualEnd }
        : undefined,

      approval: prismaWorkPlan.approvedBy
        ? { by: prismaWorkPlan.approvedBy, at: prismaWorkPlan.approvedAt, comments: prismaWorkPlan.approvalComments }
        : undefined,

      rejection: prismaWorkPlan.rejectedBy
        ? { by: prismaWorkPlan.rejectedBy, at: prismaWorkPlan.rejectedAt, reason: prismaWorkPlan.rejectionReason }
        : undefined,
    };
  }

  async create(data: Omit<WorkPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkPlan> {
    const created = await prisma.workPlan.create({
      data: {
        orderId: data.orderId,
        status: data.status,
        estimatedBudget: data.estimatedBudget,

        materials: stringifyJSON(data.materials),
        tools: stringifyJSON(data.tools),
        equipment: stringifyJSON(data.equipment),
        ppe: stringifyJSON(data.ppe),
        asts: stringifyJSON(data.asts),
        checklists: stringifyJSON(data.checklists),
        budgetBreakdown: stringifyJSON(data.budgetBreakdown as any[]),
        tasks: stringifyJSON(data.tasks),
        attachments: stringifyJSON(data.attachments),
        safetyMeetings: stringifyJSON(data.safetyMeetings),

        assignedTeam: data.assignedTeam ? JSON.stringify(data.assignedTeam) : null,
        notes: data.notes,
        createdById: data.createdBy, // Mapear de dominio createdBy a Prisma createdById
        title: '', // Campo requerido por Prisma - usar valor por defecto
        description: data.notes || '', // Campo requerido por Prisma

        // Descomposición de objetos
        plannedStart: data.plannedWindow?.start,
        plannedEnd: data.plannedWindow?.end,
        actualStart: data.actualWindow?.start,
        actualEnd: data.actualWindow?.end,

        approvedBy: data.approval?.by,
        approvedAt: data.approval?.at,
        approvalComments: data.approval?.comments,

        rejectedBy: data.rejection?.by,
        rejectedAt: data.rejection?.at,
        rejectionReason: data.rejection?.reason,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: Partial<WorkPlan>): Promise<WorkPlan> {
    const updateData: any = { ...data };

    // Serializar arrays
    if (data.materials) updateData.materials = stringifyJSON(data.materials);
    if (data.tools) updateData.tools = stringifyJSON(data.tools);
    // ... repetir para todos los arrays

    // Descomponer objetos
    if (data.plannedWindow) {
      updateData.plannedStart = data.plannedWindow.start;
      updateData.plannedEnd = data.plannedWindow.end;
    }

    // Limpiar props de dominio que no existen en DB plana
    delete updateData.plannedWindow;
    delete updateData.actualWindow;
    delete updateData.approval;
    delete updateData.rejection;

    const updated = await prisma.workPlan.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<WorkPlan | null> {
    const found = await prisma.workPlan.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByOrderId(orderId: string): Promise<WorkPlan | null> {
    const found = await prisma.workPlan.findFirst({ where: { orderId } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(
    filters: WorkPlanFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<WorkPlan[]> {
    const where: Prisma.WorkPlanWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.createdBy) where.createdById = filters.createdBy;

    const items = await prisma.workPlan.findMany({
      where,
      take: pagination?.limit,
      skip: pagination?.skip,
      orderBy: sorting
        ? { [sorting.field]: sorting.order }
        : { createdAt: 'desc' },
    });

    return items.map(wp => this.toDomain(wp));
  }

  async count(filters: WorkPlanFilters): Promise<number> {
    const where: Prisma.WorkPlanWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.createdBy) where.createdById = filters.createdBy;

    return prisma.workPlan.count({ where });
  }

  async delete(id: string): Promise<void> {
    await prisma.workPlan.delete({ where: { id } });
  }

  async findUsingKit(kitId: string): Promise<WorkPlan[]> {
    // Búsqueda en memoria (limitación de SQLite/Prisma con JSON arrays)
    // Idealmente, si hay muchos workplans, esto debería optimizarse con una tabla relacional intermedia
    const allPlans = await prisma.workPlan.findMany();

    return allPlans
      .filter(wp => {
        const resources = [
          ...(parseJSON(wp.materials)),
          ...(parseJSON(wp.tools)),
          ...(parseJSON(wp.equipment))
        ];
        // Asumiendo que los recursos tienen propiedad 'kitId' o 'id' que matchea
        return resources.some((r: any) => r.kitId === kitId || r.id === kitId);
      })
      .map(wp => this.toDomain(wp));
  }

  async countPendingByOrderId(orderId: string): Promise<number> {
    return prisma.workPlan.count({
      where: {
        orderId,
        status: { in: [WorkPlanStatus.DRAFT, 'PENDIENTE'] } // Ajustar según enum real
      }
    });
  }

  async markAsOrphaned(orderId: string): Promise<void> {
    // En DB relacional estricta esto fallaría (FK).
    // Si es soft delete, actualizamos status. Si es hard delete, borramos.
    // Asumiremos borrado lógico o flag.
    await prisma.workPlan.updateMany({
      where: { orderId },
      data: { status: 'CANCELLED' } // O un estado que indique "huérfano"
    });
  }

  // --- Legacy Methods ---

  async findWorkPlansUsingKit(kitId: string): Promise<WorkPlan[]> {
    return this.findUsingKit(kitId);
  }

  async countByOrderId(orderId: string): Promise<number> {
    return prisma.workPlan.count({ where: { orderId } });
  }
}

export const workPlanRepository = new WorkPlanRepository();
