import prisma from '../prisma';
import type { Evidence } from '@/domain/entities/Evidence';
import type { IEvidenceRepository } from '@/domain/repositories/IEvidenceRepository';
import { Prisma } from '@prisma/client';

export class EvidenceRepository implements IEvidenceRepository {
  /**
   * Convertir Prisma Evidence a Domain Evidence
   */
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
      previousVersions: prismaEvidence.previousVersions 
        ? JSON.parse(prismaEvidence.previousVersions) 
        : [],
      uploadedBy: prismaEvidence.uploadedById,
      createdAt: prismaEvidence.createdAt,
      updatedAt: prismaEvidence.updatedAt,
      metadata: prismaEvidence.metadata ? JSON.parse(prismaEvidence.metadata) : undefined,
      approvedBy: prismaEvidence.approvedBy ?? undefined,
      approvedAt: prismaEvidence.approvedAt ?? undefined,
      approvalComments: prismaEvidence.approvalComments ?? undefined,
      rejectedBy: prismaEvidence.rejectedBy ?? undefined,
      rejectedAt: prismaEvidence.rejectedAt ?? undefined,
      rejectionReason: prismaEvidence.rejectionReason ?? undefined,
    };
  }

  async findById(id: string): Promise<Evidence | null> {
    const prismaEvidence = await prisma.evidence.findUnique({
      where: { id },
      include: {
        order: true,
        uploadedBy: true,
      },
    });

    return prismaEvidence ? this.toDomain(prismaEvidence) : null;
  }

  async findByOrderId(orderId: string): Promise<Evidence[]> {
    const prismaEvidences = await prisma.evidence.findMany({
      where: { orderId },
      include: {
        uploadedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaEvidences.map((e) => this.toDomain(e));
  }

  async create(data: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evidence> {
    const createData: any = {
      orderId: data.orderId,
      stage: data.stage as string,
      type: data.type as string,
      filename: data.fileName,
      mimetype: data.mimeType as string,
      size: data.fileSize as number,
      filepath: data.filePath as string,
      status: data.status,
      version: (data.version as number) ?? 1,
      previousVersions: Array.isArray(data.previousVersions) && data.previousVersions.length > 0
        ? JSON.stringify(data.previousVersions)
        : null,
      uploadedById: data.uploadedBy,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      approvedBy: data.approvedBy ?? null,
      approvedAt: data.approvedAt ? (data.approvedAt as Date) : null,
      approvalComments: data.approvalComments ?? null,
      rejectedBy: data.rejectedBy ?? null,
      rejectedAt: data.rejectedAt ? (data.rejectedAt as Date) : null,
      rejectionReason: data.rejectionReason ?? null,
    };

    const prismaEvidence = await prisma.evidence.create({
      data: createData,
      include: {
        order: true,
        uploadedBy: true,
      },
    });

    return this.toDomain(prismaEvidence);
  }

  async update(id: string, data: Partial<Evidence>): Promise<Evidence> {
    const updateData: any = {};

    if (data.stage !== undefined) updateData.stage = data.stage as string;
    if (data.type !== undefined) updateData.type = data.type as string;
    if (data.fileName !== undefined) updateData.filename = data.fileName as string;
    if (data.mimeType !== undefined) updateData.mimetype = data.mimeType as string;
    if (data.fileSize !== undefined) updateData.size = data.fileSize as number;
    if (data.filePath !== undefined) updateData.filepath = data.filePath as string;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.version !== undefined) updateData.version = data.version as number;
    if (data.previousVersions !== undefined) {
      updateData.previousVersions = Array.isArray(data.previousVersions) && data.previousVersions.length > 0
        ? JSON.stringify(data.previousVersions)
        : null;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    }
    if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy;
    if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt as Date;
    if (data.approvalComments !== undefined) updateData.approvalComments = data.approvalComments as string;
    if (data.rejectedBy !== undefined) updateData.rejectedBy = data.rejectedBy;
    if (data.rejectedAt !== undefined) updateData.rejectedAt = data.rejectedAt as Date;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason as string;

    const prismaEvidence = await prisma.evidence.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        uploadedBy: true,
      },
    });

    return this.toDomain(prismaEvidence);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.evidence.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async approve(id: string, approvedBy: string): Promise<Evidence> {
    const prismaEvidence = await prisma.evidence.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    return this.toDomain(prismaEvidence);
  }

  async reject(id: string, rejectedBy: string, reason: string): Promise<Evidence> {
    const prismaEvidence = await prisma.evidence.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    return this.toDomain(prismaEvidence);
  }

  async findAll(filters?: {
    status?: string;
    orderId?: string;
    uploadedById?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ evidences: Evidence[]; total: number }> {
    const where: Prisma.EvidenceWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.uploadedById) where.uploadedById = filters.uploadedById;

    const [prismaEvidences, total] = await Promise.all([
      prisma.evidence.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.skip || 0,
        include: {
          order: true,
          uploadedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.evidence.count({ where }),
    ]);

    const evidences = prismaEvidences.map((e) => this.toDomain(e));

    return { evidences, total };
  }

  async findByOrderIdAndStage(orderId: string, stage: string): Promise<Evidence[]> {
    const prismaEvidences = await prisma.evidence.findMany({
      where: { orderId, stage },
      orderBy: { createdAt: 'desc' },
    });

    return prismaEvidences.map((e) => this.toDomain(e));
  }

  async find(filters: {
    orderId?: string;
    stage?: string;
    status?: string;
    uploadedBy?: string;
    limit?: number;
    skip?: number;
  }): Promise<Evidence[]> {
    const where: Prisma.EvidenceWhereInput = {};

    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.stage) where.stage = filters.stage;
    if (filters.status) where.status = filters.status;
    if (filters.uploadedBy) where.uploadedById = filters.uploadedBy;

    const prismaEvidences = await prisma.evidence.findMany({
      where,
      take: filters.limit || 20,
      skip: filters.skip || 0,
      orderBy: { createdAt: 'desc' },
    });

    return prismaEvidences.map((e) => this.toDomain(e));
  }

  async count(filters: {
    orderId?: string;
    stage?: string;
    status?: string;
  }): Promise<number> {
    const where: Prisma.EvidenceWhereInput = {};

    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.stage) where.stage = filters.stage;
    if (filters.status) where.status = filters.status;

    return prisma.evidence.count({ where });
  }

  async deleteByOrderId(orderId: string): Promise<number> {
    const result = await prisma.evidence.deleteMany({
      where: { orderId },
    });

    return result.count;
  }
}

export const evidenceRepository = new EvidenceRepository();

