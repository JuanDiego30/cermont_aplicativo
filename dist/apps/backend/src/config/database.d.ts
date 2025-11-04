import { Connection } from 'mongoose';
interface DBHealth {
    status: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';
    isConnected: boolean;
    dbName: string;
    host: string;
}
export declare const connectDB: () => Promise<Connection>;
export declare const closeDB: () => Promise<void>;
export declare const checkDBHealth: () => DBHealth;
export {};
//# sourceMappingURL=database.d.ts.map