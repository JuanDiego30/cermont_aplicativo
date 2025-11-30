import { IOrderRepository, OrderFilters, PaginationParams, OrderDashboardStats } from '../repositories/IOrderRepository.js';
import { AuditService } from './AuditService.js';
import { CreateOrderUseCase } from '../../app/orders/use-cases/CreateOrder.js';
import { Order, OrderState } from '../entities/Order.js';
import { AppError } from '../../shared/errors/AppError.js';
import { AuditAction } from '../entities/AuditLog.js';

export class OrderService {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly auditService: AuditService,
        private readonly createOrderUseCase: CreateOrderUseCase
    ) { }

    async findAll(
        filters: OrderFilters,
        pagination: PaginationParams
    ): Promise<{ orders: Order[]; total: number }> {
        const [orders, total] = await Promise.all([
            this.orderRepository.findAll(filters, pagination),
            this.orderRepository.count(filters),
        ]);

        return { orders, total };
    }

    async findById(id: string): Promise<Order> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new AppError('Orden no encontrada', 404);
        }
        return order;
    }

    async create(data: any, userId: string, ip?: string, userAgent?: string): Promise<Order> {
        // Delegate to UseCase
        const newOrder = await this.createOrderUseCase.execute({
            ...data,
            createdBy: userId,
        });

        await this.auditService.log({
            entityType: 'Order',
            entityId: newOrder.id,
            action: AuditAction.CREATE_ORDER,
            userId,
            after: { ...data, state: OrderState.SOLICITUD },
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown',
            reason: 'Order created',
        });

        return newOrder;
    }

    async update(id: string, data: Partial<Order>, userId: string, ip?: string, userAgent?: string): Promise<Order> {
        const order = await this.findById(id); // Ensure exists

        const updated = await this.orderRepository.update(id, data);

        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: AuditAction.UPDATE_ORDER,
            userId,
            after: data,
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown',
            reason: 'Order updated',
        });

        return updated;
    }

    async transition(id: string, newState: OrderState, userId: string, ip?: string, userAgent?: string): Promise<Order> {
        const order = await this.findById(id);

        // TODO: Add state transition validation logic here (e.g. using StateMachine) if not already in repository/entity

        const updated = await this.orderRepository.update(id, { state: newState });

        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: AuditAction.TRANSITION_ORDER_STATE,
            userId,
            after: { state: newState },
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown',
            reason: `Order transitioned to ${newState}`,
        });

        return updated;
    }

    async archive(id: string, userId: string, ip?: string, userAgent?: string): Promise<Order> {
        const order = await this.findById(id);

        const updated = await this.orderRepository.archive(id, userId);

        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: AuditAction.ARCHIVE_ORDER,
            userId,
            after: { archived: true },
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown',
            reason: 'Order archived',
        });

        return updated;
    }

    async assign(id: string, responsibleId: string, userId: string, ip?: string, userAgent?: string): Promise<Order> {
        const order = await this.findById(id);

        const updated = await this.orderRepository.update(id, { responsibleId });

        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: AuditAction.ASSIGN_RESPONSIBLE,
            userId,
            after: { responsibleId },
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown',
            reason: 'Order assigned to user',
        });

        return updated;
    }

    async delete(id: string, userId: string, ip?: string, userAgent?: string): Promise<void> {
        const order = await this.findById(id);

        await this.auditService.log({
            entityType: 'Order',
            entityId: id,
            action: AuditAction.DELETE_ORDER,
            userId,
            before: { deleted: false },
            after: { deleted: true },
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown',
            reason: 'Order deleted',
        });

        await this.orderRepository.delete(id);
    }

    async getDashboardStats(filters?: OrderFilters): Promise<OrderDashboardStats> {
        return this.orderRepository.getDashboardStats(filters);
    }
}
