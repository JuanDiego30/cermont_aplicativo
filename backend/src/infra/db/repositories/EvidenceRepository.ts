import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import type { Evidence } from '../../../domain/entities/Evidence.js';
import type { 
  IEvidenceRepository, 
  EvidenceFilters, 
  PaginationParams, 
  SortingParams 
} from '../../../domain/repositories/IEvidenceRepository.js';

export class EvidenceRepository implements IEvidenceRepository {

  private toDomain(prismaEvidence: any): Evidence {
    return {
      id: prismaEvidence.id,
      orderId: prismaEvidence.orderId,
      stage: prismaEvidence.stage,
      type: prismaEvidence.type,
      fileName: prismaEvidence.filename,
      mimeType: prismaEvidence.mimetype,
      fileSize: prismaEvidence.size,
      filePath: prismaEvidence.filepath,
      status: prismaEvidence.status,
      version: prismaEvidence.version ?? 1,
      previousVersions: typeof prismaEvidence.previousVersions === 'string'
        ? JSON.parse(prismaEvidence.previousVersions)
        : prismaEvidence.previousVersions ?? [],
      uploadedBy: prismaEvidence.uploadedById,
      createdAt: prismaEvidence.createdAt,
      updatedAt: prismaEvidence.updatedAt,
      metadata: typeof prismaEvidence.metadata === 'string'
        ? JSON.parse(prismaEvidence.metadata)
        : prismaEvidence.metadata ?? {},
      approvedBy: prismaEvidence.approvedBy ?? undefined,
      approvedAt: prismaEvidence.approvedAt ?? undefined,
      approvalComments: prismaEvidence.approvalComments ?? undefined,
      rejectedBy: prismaEvidence.rejectedBy ?? undefined,
      rejectedAt: prismaEvidence.rejectedAt ?? undefined,
      rejectionReason: prismaEvidence.rejectionReason ?? undefined,
    };
  }

  async create(data: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evidence> {
    const createData: Prisma.EvidenceUncheckedCreateInput = {
      orderId: data.orderId,
      stage: data.stage,
      type: data.type,
      filename: data.fileName,
      mimetype: data.mimeType,
      size: data.fileSize,
      filepath: data.filePath,
      status: data.status,
      version: data.version ?? 1,
      previousVersions: data.previousVersions ? JSON.stringify(data.previousVersions) : '[]',
      uploadedById: data.uploadedBy,
      checksum: data.metadata?.checksum ?? '', // Required by Prisma schema
      metadata: data.metadata ? JSON.stringify(data.metadata) : '{}',
      approvedBy: data.approvedBy,
      approvedAt: data.approvedAt,
      approvalComments: data.approvalComments,
      rejectedBy: data.rejectedBy,
      rejectedAt: data.rejectedAt,
      rejectionReason: data.rejectionReason,
    };

    const created = await prisma.evidence.create({ data: createData });
    return this.toDomain(created);
  }

  async update(id: string, evidence: Partial<Evidence>): Promise<Evidence> {
    const updateData: any = {};
    
    if (evidence.status) updateData.status = evidence.status;
    if (evidence.metadata) updateData.metadata = JSON.stringify(evidence.metadata);
    if (evidence.approvedBy) updateData.approvedBy = evidence.approvedBy;
    if (evidence.approvedAt) updateData.approvedAt = evidence.approvedAt;
    if (evidence.rejectedBy) updateData.rejectedBy = evidence.rejectedBy;
    if (evidence.rejectionReason) updateData.rejectionReason = evidence.rejectionReason;
    if (evidence.previousVersions) updateData.previousVersions = JSON.stringify(evidence.previousVersions);
    if (evidence.version) updateData.version = evidence.version;

    const updated = await prisma.evidence.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Evidence | null> {
    const found = await prisma.evidence.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(
    filters: EvidenceFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Evidence[]> {
    const where: Prisma.EvidenceWhereInput = {};

    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.stage) where.stage = filters.stage;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.uploadedBy) where.uploadedById = filters.uploadedBy;
    if (filters.approvedBy) where.approvedBy = filters.approvedBy;

    const items = await prisma.evidence.findMany({
      where,
      take: pagination?.limit,
      skip: pagination?.skip,
      orderBy: sorting 
        ? { [sorting.field]: sorting.order } 
        : { createdAt: 'desc' },
    });

    return items.map(e => this.toDomain(e));
  }

  async count(filters: EvidenceFilters): Promise<number> {
    const where: Prisma.EvidenceWhereInput = {};
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.stage) where.stage = filters.stage;
    if (filters.status) where.status = filters.status;

    return prisma.evidence.count({ where });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.evidence.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findByOrderId(orderId: string): Promise<Evidence[]> {
    const items = await prisma.evidence.findMany({ where: { orderId } });
    return items.map(e => this.toDomain(e));
  }

  async findByFilters(filters: any, pagination?: any, sorting?: any): Promise<Evidence[]> {
    return this.findAll(filters, pagination, sorting);
  }

  async countByFilters(filters: any): Promise<number> {
    return this.count(filters);
  }

  async countByOrderId(orderId: string): Promise<number> {
    return prisma.evidence.count({ where: { orderId } });
  }

  async markAsOrphaned(orderId: string): Promise<void> {
    await prisma.evidence.updateMany({
      where: { orderId },
      data: { status: 'REJECTED', rejectionReason: 'Order Deleted - Orphaned' }
    });
  }
}

// Singleton instance for dependency injection
export const evidenceRepository = new EvidenceRepository();

