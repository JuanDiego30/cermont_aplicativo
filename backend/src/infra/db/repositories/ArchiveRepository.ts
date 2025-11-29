import { prisma } from '../prisma.js';
import { Order } from '../../../domain/entities/Order.js';

export interface ArchiveLogData {
    orderId: string;
    orderNumber: string;
    action: 'ARCHIVED' | 'RESTORED' | 'DELETED';
    performedBy?: string;
    details?: string;
}

export class ArchiveRepository {
    /**
     * Move an order to the history table
     */
    async moveToHistory(order: Order, fullData: any): Promise<void> {
        await prisma.orderHistory.create({
            data: {
                originalId: order.id,
                orderNumber: order.orderNumber,
                clientName: order.clientName,
                description: order.description,
                finalState: order.state,
                fullData: fullData,
                archivedBy: 'SYSTEM', // Default, can be overridden if passed
            },
        });
    }

    /**
     * Create an archive log entry
     */
    async createLog(log: ArchiveLogData): Promise<void> {
        await prisma.archiveLog.create({
            data: {
                orderId: log.orderId,
                orderNumber: log.orderNumber,
                action: log.action,
                performedBy: log.performedBy || 'SYSTEM',
                details: log.details,
            },
        });
    }

    /**
     * Find archived orders with pagination
     */
    async findArchived(page: number, limit: number, month?: string) {
        const where: any = {};

        if (month) {
            // month format YYYY-MM
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            where.archivedAt = {
                gte: startDate,
                lt: endDate,
            };
        }

        const [total, items] = await Promise.all([
            prisma.orderHistory.count({ where }),
            prisma.orderHistory.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { archivedAt: 'desc' },
            }),
        ]);

        return { total, items };
    }
}

export const archiveRepository = new ArchiveRepository();
