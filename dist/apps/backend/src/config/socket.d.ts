import { Server } from 'socket.io';
import http from 'http';
export declare const initializeSocket: (httpServer: http.Server) => Server;
export declare const getIO: () => Server;
export declare const emitToUser: (userId: string, event: string, data?: Record<string, unknown>) => void;
export declare const emitToRole: (role: string, event: string, data?: Record<string, unknown>) => void;
export declare const broadcastToAll: (event: string, data?: Record<string, unknown>) => void;
export declare const closeSocket: () => Promise<void>;
declare const _default: {
    initializeSocket: (httpServer: http.Server) => Server;
    getIO: () => Server;
    emitToUser: (userId: string, event: string, data?: Record<string, unknown>) => void;
    emitToRole: (role: string, event: string, data?: Record<string, unknown>) => void;
    broadcastToAll: (event: string, data?: Record<string, unknown>) => void;
    closeSocket: () => Promise<void>;
};
export default _default;
//# sourceMappingURL=socket.d.ts.map