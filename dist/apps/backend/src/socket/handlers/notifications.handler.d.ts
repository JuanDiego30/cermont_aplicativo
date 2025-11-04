import { Server, Socket } from 'socket.io';
import type { UserRole } from '';
interface ExtendedSocket extends Socket {
    user?: {
        _id: string;
        email: string;
        rol: UserRole;
    };
    data: {
        notifications?: Set<string>;
    };
}
interface NotificationPayload {
    id: string;
    type: string;
    title?: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    timestamp: number;
}
export declare const registerNotificationsHandlers: (io: Server, socket: ExtendedSocket) => void;
export declare const sendNotificationToUser: (io: Server, userId: string, notification: NotificationPayload) => void;
export declare const sendNotificationToRole: (io: Server, role: UserRole, notification: NotificationPayload) => void;
export declare const sendBroadcastNotification: (io: Server, notification: NotificationPayload) => void;
export declare const cleanupNotifications: (socket: ExtendedSocket) => void;
export {};
//# sourceMappingURL=notifications.handler.d.ts.map