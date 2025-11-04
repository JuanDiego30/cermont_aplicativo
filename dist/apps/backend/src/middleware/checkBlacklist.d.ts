import type { TypedRequest } from '';
export declare const checkBlacklist: (req: TypedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const isTokenBlacklisted: (token: string, req?: TypedRequest) => Promise<boolean>;
export default checkBlacklist;
//# sourceMappingURL=checkBlacklist.d.ts.map