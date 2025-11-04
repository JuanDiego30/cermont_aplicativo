import { Server, Socket } from 'socket.io';
import type { UserRole } from '';
interface ExtendedSocket extends Socket {
    user: {
        _id: string;
        email: string;
        rol: UserRole;
        nombre: string;
    };
    data: {
        orders?: Set<string>;
    };
}
export declare const registerOrdersHandlers: (io: Server, socket: ExtendedSocket) => void;
export declare const notifyOrderUpdate: (io: Server, orderId: string, updateData: Record<string, any>) => void;
export declare const notifyOrderStatusChange: (io: Server, orderId: string, previousStatus: string, newStatus: string) => void;
export declare const notifyNewNote: (io: Server, orderId: string, note: {
    _id: string;
    content: string;
    authorId: string;
}, author: {
    _id: string;
    nombre: string;
    rol: UserRole;
}) => void;
export declare const notifyNewEvidence: (io: Server, orderId: string, evidence: {
    _id: string;
    type: string;
    url?: string;
}) => void;
export declare const cleanupOrders: (socket: ExtendedSocket) => void;
export {};
//# sourceMappingURL=orders.handler.d.ts.map