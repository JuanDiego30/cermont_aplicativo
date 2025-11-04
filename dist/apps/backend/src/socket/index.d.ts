import { Server } from 'socket.io';
import http from 'http';
import type { UserRole } from '';
type HttpServer = http.Server;
export declare const initializeSocket: (server: HttpServer) => Server;
export declare const getIO: () => Server;
export declare const emitToUser: (userId: string, event: string, data: any) => void;
export declare const emitToRole: (role: UserRole, event: string, data: any) => void;
export declare const emitToAll: (event: string, data: any) => void;
export declare const getConnectedUsers: () => Promise<Array<{
    userId: string;
    userRole: UserRole;
    userName: string;
    socketId: string;
}>>;
export declare const disconnectUser: (userId: string, reason?: string) => Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map