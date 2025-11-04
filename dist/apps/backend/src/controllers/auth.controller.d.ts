import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const login: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const logoutAll: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const refreshToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getSessions: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const revokeSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const changePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const forgotPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const resetPassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const verifyToken: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=auth.controller.d.ts.map