import { ROLES } from '../utils/constants';
import { Socket } from 'socket.io';
export interface AuthUser {
    userId: string;
    email: string;
    rol: typeof ROLES[number];
    nombre?: string;
    telefono?: string;
    cargo?: string;
}
export interface TypedRequest extends Request {
    user?: AuthUser;
}
export declare const authenticate: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAuth: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authenticateSocket: (socket: Socket & {
    user?: AuthUser;
    userId?: string;
    rol?: string;
}, next: (err?: Error) => void) => Promise<void>;
declare const _default: {
    authenticate: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
    optionalAuth: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
    requireAuth: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
    authenticateSocket: (socket: Socket & {
        user?: AuthUser;
        userId?: string;
        rol?: string;
    }, next: (err?: Error) => void) => Promise<void>;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map