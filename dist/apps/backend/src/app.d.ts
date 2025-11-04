import { type Application } from 'express';
import type { Server } from 'http';
declare const app: Application;
declare const gracefulShutdown: (server: Server) => void;
export default app;
export { gracefulShutdown };
//# sourceMappingURL=app.d.ts.map