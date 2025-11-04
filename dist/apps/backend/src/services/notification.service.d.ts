interface UserMinimal {
    _id: string;
    nombre: string;
    email: string;
    rol?: string;
}
interface OrderMinimal {
    _id: string;
    numeroOrden: string;
    clienteNombre: string;
    asignadoA: string[];
    supervisorId?: string;
    fechaFinEstimada?: Date;
    createdAt?: Date;
}
interface NoteMinimal {
    contenido: string;
    createdAt?: Date;
}
interface NotificationData {
    orderId: string;
    numeroOrden: string;
    clienteNombre?: string;
    previousStatus?: string;
    newStatus?: string;
    changedBy?: string;
    note?: string;
    addedBy?: string;
    addedAt?: Date;
    createdBy?: string;
    createdAt?: Date;
    diasRestantes?: number;
    message?: string;
}
interface NotificationService {
    notifyOrderCreated: (order: OrderMinimal, createdBy?: UserMinimal | null) => Promise<void>;
    notifyOrderAssigned: (order: OrderMinimal, assignedUsers: UserMinimal[], assignedBy: UserMinimal) => Promise<void>;
    notifyOrderStatusChanged: (order: OrderMinimal, previousStatus: string, newStatus: string, changedBy: UserMinimal) => Promise<void>;
    notifyOrderNoteAdded: (order: OrderMinimal, note: NoteMinimal, addedBy: UserMinimal) => Promise<void>;
    notifyUserCreated: (user: UserMinimal, createdBy?: UserMinimal | null) => Promise<void>;
    notifyPasswordChanged: (user: UserMinimal) => Promise<void>;
    notifyUpcomingDeadlines: (orders: OrderMinimal[]) => Promise<void>;
    getInvolvedUsers: (userIds: string[]) => Promise<UserMinimal[]>;
}
declare class NotificationService implements NotificationService {
    notifyOrderCreated(order: OrderMinimal, createdBy?: UserMinimal | null): Promise<void>;
    notifyOrderAssigned(order: OrderMinimal, assignedUsers: UserMinimal[], assignedBy: UserMinimal): Promise<void>;
    notifyOrderStatusChanged(order: OrderMinimal, previousStatus: string, newStatus: string, changedBy: UserMinimal): Promise<void>;
    notifyOrderNoteAdded(order: OrderMinimal, note: NoteMinimal, addedBy: UserMinimal): Promise<void>;
    notifyUserCreated(user: UserMinimal, createdBy?: UserMinimal | null): Promise<void>;
    notifyPasswordChanged(user: UserMinimal): Promise<void>;
    notifyUpcomingDeadlines(orders: OrderMinimal[]): Promise<void>;
    private getInvolvedUsers;
}
declare const _default: NotificationService;
export default _default;
export type { NotificationService, UserMinimal, OrderMinimal, NoteMinimal, NotificationData };
//# sourceMappingURL=notification.service.d.ts.map