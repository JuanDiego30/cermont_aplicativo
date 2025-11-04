import { ROLES } from '../utils/constants';
import { Socket } from 'socket.io';
import type { AuthUser, TypedRequest } from '';
type Role = typeof ROLES[keyof typeof ROLES];
export declare const requireRole: (...allowedRoles: Role[]) => (req: TypedRequest, res: Response, next: NextFunction) => void;
export declare const requireRoleOrHigher: (minRole: Role) => (req: TypedRequest, res: Response, next: NextFunction) => void;
export declare const requireOwnerOrAdmin: (resourceIdParam?: string) => (req: TypedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...allowedRoles: Role[]) => ReturnType<typeof requireRole>;
export declare const requireMinRole: (minRole: Role) => (req: TypedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeSocketRole: (allowedRoles: Role | Role[]) => ((socket: Socket & {
    user?: AuthUser;
}, next: (err?: Error) => void) => void);
export declare const requireAdmin: () => ReturnType<typeof requireRole>;
export declare const requireEngineer: () => ReturnType<typeof requireRole>;
export declare const requireTechnicianOrHigher: () => ReturnType<typeof requireRoleOrHigher>;
export declare const requireEngineerOrHigher: () => ReturnType<typeof requireRoleOrHigher>;
declare const _default: {
    requireRole: (...allowedRoles: Role[]) => (req: TypedRequest, res: Response, next: NextFunction) => void;
    requireRoleOrHigher: (minRole: Role) => (req: TypedRequest, res: Response, next: NextFunction) => void;
    requireOwnerOrAdmin: (resourceIdParam?: string) => (req: TypedRequest, res: Response, next: NextFunction) => void;
    authorizeRoles: (...allowedRoles: Role[]) => ReturnType<typeof requireRole>;
    authorizeSocketRole: (allowedRoles: Role | Role[]) => ((socket: Socket & {
        user?: AuthUser;
    }, next: (err?: Error) => void) => void);
    requireAdmin: () => ReturnType<typeof requireRole>;
    requireEngineer: () => ReturnType<typeof requireRole>;
};
export default _default;
//# sourceMappingURL=authorize.d.ts.map